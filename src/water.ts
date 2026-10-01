import { BufferGeometry, Color, Float32BufferAttribute, Group, Matrix4, Mesh, PropertyBinding, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import type { Theme, WaterProfile } from "./scenes";

const riverShader = {
  name: "Miniature river",
  uniforms: UniformsUtils.merge([UniformsLib.fog, {
    color: { value: new Color() },
    tDiffuse: { value: null },
    textureMatrix: { value: new Matrix4() },
    time: { value: 0 },
    sunlight: { value: 1 }
  }]),
  vertexShader: `
    uniform mat4 textureMatrix;
    varying vec4 reflectionUv;
    varying vec3 worldPoint;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    #include <fog_pars_vertex>
    void main() {
      reflectionUv = textureMatrix * vec4(position, 1.0);
      worldPoint = (modelMatrix * vec4(position, 1.0)).xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <logdepthbuf_vertex>
      #include <fog_vertex>
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float sunlight;
    varying vec4 reflectionUv;
    varying vec3 worldPoint;
    #include <common>
    #include <logdepthbuf_pars_fragment>
    #include <fog_pars_fragment>
    void main() {
      #include <logdepthbuf_fragment>
      vec2 p = worldPoint.xz;
      float a = p.x * 2.8 + p.y * 1.1 + time * 0.70;
      float b = p.x * -1.9 + p.y * 3.6 - time * 0.52;
      float c = p.x * 6.2 + p.y * -2.6 + time * 0.91;
      vec2 slope = vec2(2.8, 1.1) * cos(a) * 0.024
        + vec2(-1.9, 3.6) * cos(b) * 0.014
        + vec2(6.2, -2.6) * cos(c) * 0.006;
      vec3 normal = normalize(vec3(-slope.x, 1.0, -slope.y));
      vec3 eye = normalize(cameraPosition - worldPoint);
      vec2 uv = reflectionUv.xy / reflectionUv.w + slope * 0.008;
      vec4 reflected = texture2D(tDiffuse, uv);
      float fresnel = 0.32 + 0.45 * pow(1.0 - max(dot(eye, normal), 0.0), 3.0);
      float ripples = sin(a) * 0.020 + sin(b) * 0.015 + sin(c) * 0.008;
      vec3 base = color * (1.0 + ripples);
      vec3 mirrorColor = mix(base, reflected.rgb, reflected.a);
      vec3 lightDirection = normalize(vec3(-0.55, 0.85, 0.45));
      float sparkle = pow(max(dot(reflect(-lightDirection, normal), eye), 0.0), 90.0);
      vec3 river = mix(base, mirrorColor, fresnel) + vec3(0.70, 0.78, 0.65) * sparkle * sunlight * 0.16;
      gl_FragColor = vec4(river, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }
  `
};

export class SceneWater {
  private readonly surface: Reflector;
  private readonly profile: WaterProfile;

  constructor(model: Group, profile: WaterProfile, compact: boolean) {
    this.profile = profile;
    let source: Mesh | undefined;
    const nodeName = PropertyBinding.sanitizeNodeName(profile.nodeName);
    model.traverse(child => {
      if (child instanceof Mesh && child.name === nodeName) source = child;
    });
    if (!source) throw new Error(`Water mesh not found: ${profile.nodeName}`);
    model.updateMatrixWorld(true);
    const position = source.geometry.getAttribute("position");
    const normal = source.geometry.getAttribute("normal");
    const index = source.geometry.getIndex();
    const count = index ? index.count : position.count;
    const vertex = new Vector3();
    const points: number[] = [];
    const sides: number[] = [];
    let level = 0;
    for (let i = 0; i < count; i += 3) {
      const triangle = [0, 1, 2].map(offset => index ? index.getX(i + offset) : i + offset);
      const top = triangle.every(id => normal.getY(id) > 0.99);
      if (!top) { sides.push(...triangle); continue; }
      for (const id of triangle) {
        vertex.fromBufferAttribute(position, id).applyMatrix4(source.matrixWorld);
        points.push(vertex.x, -vertex.z, 0);
        level = vertex.y;
      }
    }
    if (!points.length) throw new Error("Water mesh has no horizontal surface");
    source.geometry.setIndex(sides);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    geometry.computeVertexNormals();
    this.surface = new Reflector(geometry, {
      shader: riverShader,
      color: profile.color.day,
      textureWidth: compact ? 512 : 1024,
      textureHeight: compact ? 512 : 1024,
      clipBias: 0, // Keep the shallow pedestal out of the reflection.
      multisample: 0
    });
    this.surface.name = "Miniature reflected water";
    (this.surface.material as ShaderMaterial).fog = true;
    this.surface.rotation.x = -Math.PI / 2;
    this.surface.position.y = level + 0.008;
    model.add(this.surface);
  }

  setTheme(theme: Theme): void {
    const uniforms = (this.surface.material as ShaderMaterial).uniforms;
    uniforms.color.value.set(this.profile.color[theme]);
    uniforms.sunlight.value = theme === "day" ? 1 : 0.12;
  }

  update(delta: number, animate: boolean): void {
    if (animate) (this.surface.material as ShaderMaterial).uniforms.time.value += delta;
  }

  dispose(): void {
    this.surface.removeFromParent();
    this.surface.geometry.dispose();
    this.surface.dispose();
  }
}
