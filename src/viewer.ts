import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BufferGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer
} from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { assetUrl, type SceneDefinition, type SceneView, type Theme } from "./scenes";

interface CameraTween {
  start: number;
  fromPosition: Vector3;
  toPosition: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
}

export class ModelViewer {
  private readonly host: HTMLElement;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(42, 1, 0.1, 1000);
  private readonly renderer: WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly draco = new DRACOLoader();
  private readonly loader = new GLTFLoader();
  private readonly ambient = new AmbientLight();
  private readonly hemisphere = new HemisphereLight();
  private readonly key = new DirectionalLight();
  private readonly fill = new DirectionalLight();
  private accents: { light: PointLight; viewId: string }[] = [];
  private readonly resizeObserver: ResizeObserver;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private model: Group | null = null;
  private definition: SceneDefinition | null = null;
  private view: SceneView | null = null;
  private theme: Theme = "day";
  private tween: CameraTween | null = null;
  private frameId = 0;
  private loadId = 0;
  private lastFrame = 0;
  private autoRotationRequested = true;
  private disposed = false;

  constructor(host: HTMLElement, private readonly onRotationChange?: (active: boolean) => void) {
    this.host = host;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.domElement.setAttribute("aria-label", "可拖动旋转的金马碧鸡坊三维模型");
    this.host.append(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.enablePan = false;
    this.controls.autoRotateSpeed = 0.38;
    this.autoRotationRequested = !this.reducedMotion.matches;
    this.controls.autoRotate = this.autoRotationRequested && !this.reducedMotion.matches;
    this.controls.minPolarAngle = Math.PI * 0.11;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.addEventListener("start", () => {
      this.tween = null;
      this.pauseRotation();
    });

    this.scene.add(this.ambient, this.hemisphere, this.key, this.key.target, this.fill, this.fill.target);
    this.draco.setWorkerLimit(2);
    this.loader.setDRACOLoader(this.draco);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.reducedMotion.addEventListener("change", this.onMotionChange);
    this.resize();
    this.frameId = requestAnimationFrame(this.render);
  }

  async load(definition: SceneDefinition, onProgress?: (progress: number | null) => void): Promise<void> {
    const loadId = ++this.loadId;
    this.disposeModel();
    this.definition = definition;
    this.view = definition.views[0];
    const gltf = await this.loader.loadAsync(assetUrl(definition.modelPath), event => {
      if (loadId !== this.loadId) return;
      onProgress?.(event.total > 0 ? event.loaded / event.total : null);
    });
    if (this.disposed || loadId !== this.loadId) {
      this.releaseGroup(gltf.scene);
      return;
    }
    this.model = gltf.scene;
    this.renderer.domElement.setAttribute("aria-label", `可拖动旋转的${definition.title}三维模型`);
    this.prepareSunShadow(definition);
    this.scene.add(this.model);
    this.placeAccentLights();
    this.setView(this.view, true);
    this.setTheme(this.theme);
    onProgress?.(1);
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    if (!this.definition) return;
    const profile = this.definition.lighting[theme];
    this.ambient.color.set(profile.ambient.color);
    this.ambient.intensity = profile.ambient.intensity;
    this.hemisphere.color.set(profile.hemisphere.sky);
    this.hemisphere.groundColor.set(profile.hemisphere.ground);
    this.hemisphere.intensity = profile.hemisphere.intensity;
    this.key.color.set(profile.key.color);
    this.key.intensity = profile.key.intensity;
    this.key.position.copy(this.key.target.position).add(new Vector3(...profile.key.position));
    this.key.castShadow = profile.key.castShadow;
    this.key.shadow.intensity = profile.key.shadowIntensity;
    this.fill.color.set(profile.fill.color);
    this.fill.intensity = profile.fill.intensity;
    this.fill.position.copy(this.fill.target.position).add(new Vector3(...profile.fill.position));
    for (const { light } of this.accents) {
      light.color.set(profile.accent.color);
      light.intensity = profile.accent.intensity;
      light.distance = profile.accent.distance;
    }
    this.renderer.toneMappingExposure = profile.exposure;
    this.updateAccentVisibility();
    if (profile.key.castShadow) this.renderer.shadowMap.needsUpdate = true;
    if (this.model) this.renderer.render(this.scene, this.camera);
  }

  setView(view: SceneView, immediate = false): void {
    this.view = view;
    if (!this.model) return;
    const focus = view.nodeMatch
      ? this.model.children.find(child => child.name.includes(view.nodeMatch!))
      : this.model;
    if (!focus) throw new Error(`Model group not found: ${view.nodeMatch}`);
    for (const child of this.model.children) child.visible = view.nodeMatch ? child === focus : true;
    this.updateAccentVisibility();
    if (this.key.castShadow) this.renderer.shadowMap.needsUpdate = true;

    const bounds = new Box3().setFromObject(focus);
    const center = bounds.getCenter(new Vector3());
    const targetOffset = this.host.clientWidth < 700 ? view.mobileTargetOffset || view.targetOffset : view.targetOffset;
    const target = center.clone().add(new Vector3(...(targetOffset || [0, 0, 0])));
    const size = bounds.getSize(new Vector3());
    const halfFov = (this.camera.fov * Math.PI) / 360;
    const tangent = Math.tan(halfFov);
    const aspect = Math.max(this.camera.aspect, 0.35);
    const mobileMargin = this.host.clientWidth < 700 ? (view.nodeMatch ? 0.9 : 1.25) : 1;
    const distance = Math.max(
      size.y / (2 * tangent),
      size.x / (2 * tangent * aspect),
      size.z / (2 * tangent)
    ) * view.distanceScale * mobileMargin + size.length() * 0.1;
    const offset = new Vector3(...view.cameraOffset).normalize().multiplyScalar(distance);
    const position = target.clone().add(offset);
    this.controls.minDistance = distance * 0.46;
    this.controls.maxDistance = distance * 2.4;
    if (immediate || this.reducedMotion.matches) {
      this.tween = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }
    this.tween = {
      start: performance.now(),
      fromPosition: this.camera.position.clone(),
      toPosition: position,
      fromTarget: this.controls.target.clone(),
      toTarget: target
    };
  }

  resetView(): void {
    if (this.view) this.setView(this.view);
  }

  pauseRotation(): void {
    this.autoRotationRequested = false;
    this.controls.autoRotate = false;
    this.onRotationChange?.(false);
  }

  setAutoRotation(enabled: boolean): boolean {
    this.autoRotationRequested = enabled;
    this.controls.autoRotate = enabled && !this.reducedMotion.matches;
    this.onRotationChange?.(this.controls.autoRotate);
    return this.controls.autoRotate;
  }

  getAutoRotation(): boolean {
    return this.controls.autoRotate;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    ++this.loadId;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.reducedMotion.removeEventListener("change", this.onMotionChange);
    this.disposeModel();
    this.controls.dispose();
    this.draco.dispose();
    this.key.shadow.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly onVisibilityChange = (): void => {
    this.lastFrame = performance.now();
  };

  private readonly onMotionChange = (): void => {
    if (this.reducedMotion.matches) this.autoRotationRequested = false;
    this.controls.autoRotate = this.autoRotationRequested && !this.reducedMotion.matches;
    this.onRotationChange?.(this.controls.autoRotate);
    if (this.reducedMotion.matches) this.tween = null;
  };

  private readonly render = (now: number): void => {
    if (this.disposed) return;
    const delta = Math.min((now - (this.lastFrame || now)) / 1000, 0.1);
    this.lastFrame = now;
    if (document.visibilityState === "visible") {
      if (this.tween) {
        const progress = Math.min((now - this.tween.start) / 700, 1);
        const eased = 1 - (1 - progress) ** 3;
        this.camera.position.lerpVectors(this.tween.fromPosition, this.tween.toPosition, eased);
        this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, eased);
        if (progress === 1) this.tween = null;
      }
      this.controls.update(delta);
      this.renderer.render(this.scene, this.camera);
    }
    this.frameId = requestAnimationFrame(this.render);
  };

  private resize(): void {
    const width = Math.max(this.host.clientWidth, 1);
    const height = Math.max(this.host.clientHeight, 1);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 1.8);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.model && this.view) this.setView(this.view, true);
  }

  private prepareSunShadow(definition: SceneDefinition): void {
    if (!this.model) return;
    const bounds = new Box3().setFromObject(this.model);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const radius = size.length() * 0.56;
    this.key.target.position.copy(center);
    this.fill.target.position.copy(center);
    this.key.shadow.mapSize.set(this.host.clientWidth < 700 ? 1024 : 2048, this.host.clientWidth < 700 ? 1024 : 2048);
    this.key.shadow.camera.left = -radius;
    this.key.shadow.camera.right = radius;
    this.key.shadow.camera.top = radius;
    this.key.shadow.camera.bottom = -radius;
    this.key.shadow.camera.near = 0.5;
    this.key.shadow.camera.far = size.length() * 2.5;
    this.key.shadow.camera.updateProjectionMatrix();
    this.key.shadow.normalBias = 0.015;
    this.key.shadow.bias = -0.0002;
    const exclusions = definition.shadowExclude.map(term => term.toLowerCase());
    this.model.traverse(child => {
      if (!(child instanceof Mesh)) return;
      const name = child.name.toLowerCase();
      child.castShadow = !exclusions.some(term => name.includes(term));
      child.receiveShadow = true;
    });
  }

  private placeAccentLights(): void {
    if (!this.model || !this.definition) return;
    for (const { light } of this.accents) this.scene.remove(light);
    const groups = this.definition.views.filter(view => view.nodeMatch);
    this.accents = [];
    groups.forEach(view => {
      const group = this.model?.children.find(child => child.name.includes(view.nodeMatch!));
      if (!group) return;
      const bounds = new Box3().setFromObject(group);
      const center = bounds.getCenter(new Vector3());
      const size = bounds.getSize(new Vector3());
      for (const side of [-1, 1]) {
        const light = new PointLight();
        light.position.copy(center).add(new Vector3(size.x * side * 0.28, -size.y * 0.18, size.z * 0.6));
        this.scene.add(light);
        this.accents.push({ light, viewId: view.id });
      }
    });
  }

  private updateAccentVisibility(): void {
    if (!this.definition || !this.view) return;
    this.accents.forEach(({ light, viewId }) => {
      light.visible = this.theme === "night" && (this.view?.id === this.definition?.views[0].id || this.view?.id === viewId);
    });
  }

  private disposeModel(): void {
    if (!this.model) return;
    this.scene.remove(this.model);
    for (const { light } of this.accents) this.scene.remove(light);
    this.accents = [];
    this.releaseGroup(this.model);
    this.model = null;
  }

  private releaseGroup(group: Group): void {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    const textures = new Set<Texture>();
    group.traverse(child => {
      if (!(child instanceof Mesh)) return;
      geometries.add(child.geometry);
      for (const material of Array.isArray(child.material) ? child.material : [child.material]) materials.add(material);
    });
    for (const material of materials) {
      for (const value of Object.values(material as unknown as Record<string, unknown>)) {
        if (value instanceof Texture) textures.add(value);
      }
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
    for (const geometry of geometries) geometry.dispose();
  }
}
