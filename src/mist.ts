import { Color, Group, Mesh, PlaneGeometry, ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import type { MistProfile, Theme } from "./scenes";

const vertexShader = `
  uniform vec2 size;
  varying vec2 vUv;
  #include <fog_pars_vertex>
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mvPosition.xy += position.xy * size;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = `
  uniform vec3 cloudColor;
  uniform float time;
  uniform float seed;
  uniform float density;
  varying vec2 vUv;
  #include <fog_pars_fragment>

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
               mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x), f.y);
  }
  float plume(vec2 p, vec2 center, vec2 radius) {
    vec2 d = (p - center) / radius;
    return exp(-dot(d, d) * 2.0);
  }
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    vec2 flow = vec2(time * 0.017, time * 0.006) + vec2(seed * 3.7, seed);
    float billow = noise(p * vec2(4.0, 3.0) + flow) * 0.58
                 + noise(p * vec2(8.0, 5.0) - flow * 0.7) * 0.28
                 + noise(p * vec2(16.0, 9.0) + flow * 0.4) * 0.14;
    p.y += (billow - 0.5) * 0.32;
    float shape = plume(p, vec2(-0.51, -0.05), vec2(0.52, 0.35))
                + plume(p, vec2(-0.05, 0.09), vec2(0.53, 0.48))
                + plume(p, vec2(0.46, -0.04), vec2(0.47, 0.31));
    float feather = (1.0 - smoothstep(0.70, 0.98, abs(p.x)))
                  * (1.0 - smoothstep(0.50, 0.94, abs(p.y)));
    float alpha = density * shape * feather * smoothstep(0.16, 0.79, billow);
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(cloudColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export class SceneMist {
  readonly group = new Group();
  private readonly geometry = new PlaneGeometry(1, 1);
  private readonly materials: ShaderMaterial[] = [];
  private elapsed = 0;

  constructor(private readonly profile: MistProfile) {
    this.group.name = "Original Xingping drifting mist";
    profile.formations.forEach((formation, index) => {
      const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: UniformsUtils.merge([
          UniformsLib.fog,
          { size: { value: formation.size }, cloudColor: { value: new Color(profile.color.day) }, time: { value: 0 }, seed: { value: index + 1 }, density: { value: formation.density } }
        ]),
        transparent: true,
        depthWrite: false,
        fog: true
      });
      const mesh = new Mesh(this.geometry, material);
      mesh.position.set(...formation.position);
      // The shader faces each rendering camera, including the water reflection.
      // Its inexpensive quad may extend beyond the unit geometry's bounds.
      mesh.frustumCulled = false;
      this.group.add(mesh);
      this.materials.push(material);
    });
  }

  setTheme(theme: Theme): void {
    for (const material of this.materials) material.uniforms.cloudColor.value.set(this.profile.color[theme]);
  }

  update(delta: number, animate: boolean): void {
    if (animate) this.elapsed += delta;
    for (const material of this.materials) material.uniforms.time.value = this.elapsed;
  }

  dispose(): void {
    this.geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.group.removeFromParent();
  }
}
