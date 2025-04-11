import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, PhysicsAggregate, PhysicsShapeType, Mesh } from "@babylonjs/core";

export class Staircase {
  private scene: Scene;
  private stepCount: number;
  private stepWidth: number;
  private stepHeight: number;
  private stepDepth: number;
  private material: StandardMaterial;
  private mesh: Mesh | null = null;

  constructor(scene: Scene, stepCount = 10, stepWidth = 2, stepHeight = 0.5, stepDepth = 1) {
    this.scene = scene;
    this.stepCount = stepCount;
    this.stepWidth = stepWidth;
    this.stepHeight = stepHeight;
    this.stepDepth = stepDepth;

    this.material = new StandardMaterial("stairMaterial", scene);
    this.material.diffuseColor = Color3.White();
  }

  create(position: Vector3): void {
    let steps: Mesh[] = [];

    for (let i = 0; i < this.stepCount; i++) {
      const step = MeshBuilder.CreateBox(`step_${i}`, { width: this.stepWidth, height: this.stepHeight, depth: this.stepDepth }, this.scene);
      step.material = this.material;
      step.position = new Vector3(position.x - i * this.stepDepth, position.y + i * this.stepHeight, position.z);
      steps.push(step);
    }

    // Fusionner les marches en un seul mesh
    this.mesh = Mesh.MergeMeshes(steps, true, true, undefined, false, true);

    if (this.mesh) {
      this.mesh.name = "StaircaseMesh";
      new PhysicsAggregate(this.mesh, PhysicsShapeType.MESH, { mass: 0, restitution: 0 }, this.scene);
    }
  }

  getMesh(): Mesh | null {
    return this.mesh;
  }
}
