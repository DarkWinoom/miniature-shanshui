import { DataTexture, Group, Mesh, MeshStandardMaterial, MeshToonMaterial, NearestFilter, RedFormat } from "three";

export function applyToonMaterials(model: Group): void {
  const gradient = new DataTexture(new Uint8Array([24, 56, 92, 130, 169, 211, 255]), 7, 1, RedFormat);
  gradient.minFilter = NearestFilter;
  gradient.magFilter = NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  const replacements = new Map<MeshStandardMaterial, MeshToonMaterial>();
  const convert = (source: MeshStandardMaterial): MeshToonMaterial => {
    let material = replacements.get(source);
    if (material) return material;
    material = new MeshToonMaterial({ color: source.color.clone(), gradientMap: gradient, side: source.side, vertexColors: source.vertexColors });
    material.color.multiplyScalar(0.9);
    material.name = `${source.name} | toon`;
    replacements.set(source, material);
    return material;
  };
  model.traverse(child => {
    if (!(child instanceof Mesh)) return;
    child.material = Array.isArray(child.material)
      ? child.material.map(material => material instanceof MeshStandardMaterial ? convert(material) : material)
      : child.material instanceof MeshStandardMaterial ? convert(child.material) : child.material;
  });
  for (const source of replacements.keys()) source.dispose();
}
