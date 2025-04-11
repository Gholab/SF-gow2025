import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Texture, CSG, Mesh, PhysicsAggregate, PhysicsShapeType, Vector2, Material } from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials";

export class Basin {
  private scene: Scene;
  private length: number;
  private width: number;
  private depth: number;
  private thickness: number;
  private material: StandardMaterial;
  private mesh: Mesh | null = null;
  private waterMesh: Mesh | null = null;
  private waterMaterial: WaterMaterial;
  private skybox: Mesh;

  constructor(scene: Scene, skybox: Mesh, length = 10, width = 5, depth = 1, thickness = 0.2) {
    this.scene = scene;
    this.length = length;
    this.width = width;
    this.depth = depth;
    this.thickness = thickness;
    this.skybox = skybox;

    // --- Matériau du bassin ---
    this.material = new StandardMaterial("basinMaterial", scene);
    this.material.diffuseTexture = new Texture("textures/tiles.jpg", scene);
    (this.material.diffuseTexture as Texture).uScale = 3;
    (this.material.diffuseTexture as Texture).vScale = 3;

    // --- Création de la surface d'eau ---
    // Les dimensions intérieures de l'eau correspondent à la cavité du bassin.
    const waterLength = this.length - 2 * this.thickness;
    const waterWidth = this.width - 2 * this.thickness;
    this.waterMesh = MeshBuilder.CreateGround("waterMesh", {
      width: waterLength,
      height: waterWidth,
      subdivisions: 32
    }, this.scene);

    this.waterMaterial = new WaterMaterial("water", this.scene, new Vector2(512, 512));
    this.waterMaterial.backFaceCulling = true;

    this.waterMaterial.bumpTexture = new Texture("textures/water.jpg", this.scene);
    this.waterMaterial.bumpTexture.wrapU = Texture.WRAP_ADDRESSMODE;
    this.waterMaterial.bumpTexture.wrapV = Texture.WRAP_ADDRESSMODE;

    this.waterMaterial.windForce = 3;               // Réduisez la force du vent
    this.waterMaterial.windDirection = new Vector2(1, 1); // Gardez une direction normale
    this.waterMaterial.waveHeight = 0.01;            // Diminuez la hauteur des vagues
    this.waterMaterial.bumpHeight = 0.1;

    this.waterMaterial.waterColor = new Color3(0, 0, 221 / 255);
    this.waterMaterial.colorBlendFactor = 0.0;

    this.waterMaterial.windDirection = new Vector2(1, 1);

    this.waterMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
    this.waterMaterial.alpha = 0.7;

    this.waterMaterial.addToRenderList(this.skybox);
    this.waterMesh.material = this.waterMaterial;
  }

  create(position: Vector3): void {
    // --- Création du bassin via CSG ---
    // Création du bloc extérieur (volume total)
    const outerBox = MeshBuilder.CreateBox("outerBox", {
      width: this.length,
      height: this.depth,
      depth: this.width
    }, this.scene);

    // Création de la cavité intérieure (partie creuse du bassin)
    const innerBox = MeshBuilder.CreateBox("innerBox", {
      width: this.length - 2 * this.thickness,
      height: this.depth,
      depth: this.width - 2 * this.thickness
    }, this.scene);

    // Décalage de l'intérieur pour obtenir l'effet de paroi (ajustez si besoin)
    innerBox.position.y = 0.1;

    // Soustraction du volume intérieur pour créer le bassin creux
    const outerCSG = CSG.FromMesh(outerBox);
    const innerCSG = CSG.FromMesh(innerBox);
    this.mesh = outerCSG.subtract(innerCSG).toMesh("basinMesh", this.material, this.scene);

    // Nettoyage des meshes temporaires
    outerBox.dispose();
    innerBox.dispose();

    // Positionner le bassin à l'endroit désiré
    if (this.mesh) {
      this.mesh.position = position;
      new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0 }, this.scene);
    }

    this.waterMesh!.position = position.clone();
  }

  getMesh(): Mesh | null {
    return this.mesh;
  }
}
