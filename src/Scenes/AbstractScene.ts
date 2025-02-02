import { Engine, Scene } from "@babylonjs/core";

export abstract class AbstractScene {
  protected engine: Engine;
  public scene!: Scene;

  constructor(protected canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
  }

  public async init(): Promise<void> {
    this.scene = await this.createScene();
    this.engine.runRenderLoop(() => {
      this.update();
      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  protected abstract createScene(): Promise<Scene>;
  public abstract update(): void;

  public dispose(): void {
    this.engine.stopRenderLoop();
    this.scene.dispose();
  }
}
