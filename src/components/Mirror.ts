import {
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Mesh,
  Matrix,
  MirrorTexture
} from "@babylonjs/core";
import { Plane } from "@babylonjs/core/Maths/math.plane";

export class Mirror {
  private scene: Scene;
  private width: number;
  private height: number;
  private material: StandardMaterial;
  private mesh: Mesh | null = null;
  private mirrorTexture: MirrorTexture;

  /**
   * @param scene La scène Babylon.js.
   * @param width Largeur du miroir.
   * @param height Hauteur du miroir.
   */
  constructor(scene: Scene, width: number = 5, height: number = 5) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    // Création du matériau du miroir
    this.material = new StandardMaterial("mirrorMaterial", this.scene);
    // On peut définir une couleur diffuse de base si besoin (ici blanc)
    this.material.diffuseColor = new Color3(1, 1, 1);

    // Création de la MirrorTexture (le render target qui contiendra la réflexion)
    // Le paramètre "ratio" définit la résolution relative par rapport à la taille du canvas.
    this.mirrorTexture = new MirrorTexture("mirrorTexture", { ratio: 1 }, this.scene, true);

    // Définition du plan de réflexion
    // Ici, le plan est défini comme : 0*x + 0*y + (-1)*z + 0 = 0, c'est-à-dire le plan Z=0 avec la normale orientée vers -Z.
    this.mirrorTexture.mirrorPlane = new Plane(0, 0, 1, 0);

    // Pour éviter que le miroir ne se reflète lui-même, on définira la renderList plus tard,
    // une fois le mesh du miroir créé.

    // Exemple de personnalisation simple : un léger zoom sur la réflexion.
    this.mirrorTexture.uScale = 0.3;
    this.mirrorTexture.vScale = 0.3;


    // On assigne la texture de réflexion au matériau.
    this.material.reflectionTexture = this.mirrorTexture;
  }

  /**
   * Crée le mesh du miroir à la position spécifiée et applique l'effet personnalisé.
   * @param position Position du miroir dans la scène.
   */
  create(position: Vector3): void {
    // Création d'un plan qui servira de miroir
    this.mesh = MeshBuilder.CreatePlane("mirror", { width: this.width, height: this.height }, this.scene);
    this.mesh.position = position;

    // Optionnel : rotation du miroir pour qu'il soit orienté correctement.
    // Par exemple, pour que le miroir soit vertical et face dans la direction souhaitée :
    // this.mesh.rotation = new Vector3(0, Math.PI, 0);

    // Application du matériau sur le mesh
    this.mesh.material = this.material;

    // La renderList de la MirrorTexture doit contenir tous les meshes à refléter, à l'exception du miroir lui-même.
    console.log(this.scene.meshes)
    this.mirrorTexture.renderList = this.scene.meshes.filter(mesh => mesh !== this.mesh);

    // Personnalisation avancée : appliquer une transformation animée sur la matrice de la texture de réflexion.
    // Ici, nous appliquons une rotation continue autour de l'axe Z.
    // this.mirrorTexture.onBeforeRenderObservable.add(() => {
    //   const reflectionMatrix = this.mirrorTexture.getReflectionTextureMatrix();

    //   // Calcul d'une rotation en fonction du temps (animation simple)
    //   const angle = performance.now() * 0.001;
    //   const rotationMatrix = Matrix.RotationZ(angle);

    //   // On combine la matrice existante avec la rotation
    //   reflectionMatrix.multiplyToRef(rotationMatrix, reflectionMatrix);
    //   // Récupération de la matrice de la texture de réflexion
    // });
  }

  /**
   * Retourne le mesh du miroir.
   */
  getMesh(): Mesh | null {
    return this.mesh;
  }
}
