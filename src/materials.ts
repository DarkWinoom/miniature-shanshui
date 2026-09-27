import { Group, Mesh, MeshStandardMaterial } from "three";

type SurfaceKind = "roof" | "gold" | "stone" | "wood" | "other";

function surfaceKind(name: string): SurfaceKind {
  if (/琉璃|瓦饰|kiln variation|fired earthen glaze/i.test(name)) return "roof";
  if (/金|gilding|gold leaf/i.test(name)) return "gold";
  if (/石|slab|granite|limestone|mortar|basalt|gesso/i.test(name)) return "stone";
  if (/木|timber|lacquer|hardwood/i.test(name)) return "wood";
  return "other";
}

function addWeathering(material: MeshStandardMaterial, strength: number, scale: number): void {
  const variation = strength.toFixed(3);
  const frequency = scale.toFixed(2);
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWeatherWorld;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWeatherWorld = (modelMatrix * vec4(position, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec3 vWeatherWorld;
        float weatherHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float weatherNoise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(weatherHash(i), weatherHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(weatherHash(i + vec3(0.0, 1.0, 0.0)), weatherHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
            mix(mix(weatherHash(i + vec3(0.0, 0.0, 1.0)), weatherHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(weatherHash(i + vec3(0.0, 1.0, 1.0)), weatherHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
            f.z
          );
        }`)
      .replace("#include <color_fragment>", `#include <color_fragment>
        float weatherVariation = weatherNoise(vWeatherWorld * ${frequency}) - 0.5;
        diffuseColor.rgb *= 1.0 + weatherVariation * ${variation};`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + weatherVariation * 0.16, 0.1, 1.0);`);
  };
  material.customProgramCacheKey = () => `weathered-${variation}-${frequency}`;
  material.needsUpdate = true;
}

function weatherMaterial(material: MeshStandardMaterial): void {
  const kind = surfaceKind(material.name);
  const saturation = kind === "roof" ? 0.25 : kind === "gold" ? 0.12 : 0.035;
  const gray = (material.color.r + material.color.g + material.color.b) / 3;
  material.color.setRGB(
    material.color.r * (1 - saturation) + gray * saturation,
    material.color.g * (1 - saturation) + gray * saturation,
    material.color.b * (1 - saturation) + gray * saturation
  );
  if (kind === "roof") { material.color.multiplyScalar(0.94); material.roughness = 0.82; material.metalness = 0.02; }
  else if (kind === "gold") { material.roughness = 0.8; material.metalness = 0.04; }
  else if (kind === "stone") { material.roughness = 0.96; material.metalness = 0; }
  else if (kind === "wood") { material.roughness = 0.88; material.metalness = 0; }
  else { material.roughness = Math.max(material.roughness, 0.84); material.metalness = 0; }
  if (kind === "stone") addWeathering(material, 0.32, 0.7);
  if (kind === "wood") addWeathering(material, 0.18, 1.2);
  if (kind === "roof") addWeathering(material, 0.22, 1.1);
}

export function applyWeatheredMaterials(model: Group): void {
  const seen = new Set<MeshStandardMaterial>();
  model.traverse(child => {
    if (!(child instanceof Mesh)) return;
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      if (!(material instanceof MeshStandardMaterial) || seen.has(material)) continue;
      seen.add(material);
      weatherMaterial(material);
    }
  });
}
