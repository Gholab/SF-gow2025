import { AbstractScene } from "./AbstractScene";
import {
  Scene,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  Mesh,
  StandardMaterial,
  Color3,
  KeyboardEventTypes
} from "@babylonjs/core";
import { SceneManager } from "../SceneManager";
import { MainScene } from "./MainScene";

export class SceneA extends AbstractScene {
  private camera!: FreeCamera;
  private player!: Mesh;
  private inputMap: { [key: string]: boolean } = {};
  private initialPlayerPosition: Vector3;
  private returnPosition?: Vector3;

  constructor(
    canvas: HTMLCanvasElement,
    private sceneManager: SceneManager,
    initialPlayerPosition?: Vector3,
    returnPosition?: Vector3,
  ) {
    super(canvas);
    this.returnPosition = new Vector3(returnPosition?.x ?? 0, returnPosition?.y ?? 0, (returnPosition?.z ?? 0) -1);
    this.initialPlayerPosition = initialPlayerPosition
      ? initialPlayerPosition.clone()
      : new Vector3(0, 0.5, 0);
  }

  protected async createScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    this.player = MeshBuilder.CreateBox("player", { size: 1 }, scene);
    this.player.position = this.initialPlayerPosition.clone();
    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = Color3.Blue();
    this.player.material = playerMat;
    this.player.checkCollisions = true;

    this.camera = new FreeCamera(
      "followCamera",
      new Vector3(this.player.position.x, this.player.position.y + 10, this.player.position.z - 10),
      scene
    );
    this.camera.setTarget(this.player.position);
    this.camera.attachControl();

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    ground.checkCollisions = true;

    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this.inputMap[kbInfo.event.key] = true;
          break;
        case KeyboardEventTypes.KEYUP:
          this.inputMap[kbInfo.event.key] = false;
          break;
      }
    });

    const teleportMain = MeshBuilder.CreateSphere("teleportMain", { diameter: 1 }, scene);
    teleportMain.position = new Vector3(0, 0.5, 10);
    const matMain = new StandardMaterial("matMain", scene);
    matMain.diffuseColor = Color3.Yellow();
    teleportMain.material = matMain;

    return scene;
  }

  public update(): void {
    const delta = 0.1;
    if (this.inputMap["z"] || this.inputMap["ArrowUp"]) {
      this.player.position.z += delta;
    }
    if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
      this.player.position.z -= delta;
    }
    if (this.inputMap["q"] || this.inputMap["ArrowLeft"]) {
      this.player.position.x -= delta;
    }
    if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
      this.player.position.x += delta;
    }

    this.camera.position.x = this.player.position.x;
    this.camera.position.z = this.player.position.z - 10;
    this.camera.position.y = this.player.position.y + 10;
    this.camera.setTarget(this.player.position);


    const teleport = this.scene.getMeshByName("teleportMain");
    if (teleport) {
      const distance = Vector3.Distance(this.player.position, teleport.position);
      if (distance < 1) {
        this.sceneManager.changeScene(
          new MainScene(this.canvas, this.sceneManager, this.returnPosition)
        );
      }
    }
  }
}
