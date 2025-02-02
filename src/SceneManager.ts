import { AbstractScene } from "./Scenes/AbstractScene";

export class SceneManager {
  private currentScene: AbstractScene | null = null;

  constructor() {}

  public changeScene(newScene: AbstractScene): void {
    if (this.currentScene) {
      this.currentScene.dispose();
    }
    this.currentScene = newScene;
    this.currentScene.init();
  }

  public getCurrentScene(): AbstractScene | null {
    return this.currentScene;
  }
}
