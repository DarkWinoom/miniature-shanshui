import { DataTexture, Group, LinearFilter, Mesh, MeshStandardMaterial, MeshToonMaterial, NearestFilter, PropertyBinding, RedFormat } from "three";
import type { TerrainProfile } from "./scenes";

export function applyToonMaterials(model: Group, terrain?: TerrainProfile): void {
  const gradient = new DataTexture(new Uint8Array([24, 56, 92, 130, 169, 211, 255]), 7, 1, RedFormat);
  gradient.minFilter = NearestFilter;
  gradient.magFilter = NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  const replacements = new Map<MeshStandardMaterial, MeshToonMaterial>();
  const terrainReplacements = new Map<MeshStandardMaterial, MeshToonMaterial>();
  const terrainNode = terrain && PropertyBinding.sanitizeNodeName(terrain.nodeName);
  let terrainGradient: DataTexture | undefined;
  const convert = (source: MeshStandardMaterial, softTerrain: boolean): MeshToonMaterial => {
    // Vertex-painted rock and ground can share the same imported material.
    // Keep their replacements separate so smoothing applies only to the ground.
    const cache = softTerrain ? terrainReplacements : replacements;
    let material = cache.get(source);
    if (material) return material;
    if (softTerrain && !terrainGradient) {
      terrainGradient = new DataTexture(new Uint8Array([64, 91, 123, 158, 191, 223, 255]), 7, 1, RedFormat);
      terrainGradient.minFilter = LinearFilter;
      terrainGradient.magFilter = LinearFilter;
      terrainGradient.generateMipmaps = false;
      terrainGradient.needsUpdate = true;
    }
    material = new MeshToonMaterial({ color: source.color.clone(), gradientMap: softTerrain ? terrainGradient : gradient, side: source.side, vertexColors: source.vertexColors });
    material.color.multiplyScalar(0.9);
    material.name = `${source.name} | ${softTerrain ? "soft terrain toon" : "toon"}`;
    cache.set(source, material);
    return material;
  };
  model.traverse(child => {
    if (!(child instanceof Mesh)) return;
    const softTerrain = !!terrainNode && (child.name === terrainNode || child.parent?.name === terrainNode);
    child.material = Array.isArray(child.material)
      ? child.material.map(material => material instanceof MeshStandardMaterial ? convert(material, softTerrain) : material)
      : child.material instanceof MeshStandardMaterial ? convert(child.material, softTerrain) : child.material;
  });
  for (const source of new Set([...replacements.keys(), ...terrainReplacements.keys()])) source.dispose();
}
