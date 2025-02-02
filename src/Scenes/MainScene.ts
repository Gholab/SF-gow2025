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
  CubeTexture,
  Texture,
} from "@babylonjs/core";
import { SceneManager } from "../SceneManager";
import { SceneA } from './SceneA';
import { SceneB } from "./SceneB";

export class MainScene extends AbstractScene {
  private camera!: FreeCamera;
  private player!: Mesh;
  private teleportObjects: Mesh[] = [];
  private inputMap: { [key: string]: boolean } = {};
  private initialPlayerPosition: Vector3 = new Vector3(0, 0.5, 0);

  constructor(
    canvas: HTMLCanvasElement,
    private sceneManager: SceneManager,
    initialPlayerPosition?: Vector3
  ) {
    super(canvas);
    if (initialPlayerPosition) {
      this.initialPlayerPosition = initialPlayerPosition.clone();
    }
    this.init();
  }

  protected async createScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    this.camera = new FreeCamera("MainCamera", new Vector3(0, 20, 50), scene);
    this.camera.setTarget(new Vector3(0, 0, -20));
    const skyboxSize = 1000;
    const skybox = MeshBuilder.CreateBox("skyBox", { size: skyboxSize }, scene);
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    // Remplacez "textures/skyboxClouds" par le chemin vers vos images (conformément à la convention de BabylonJS)
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    // Cette propriété permet au skybox de rester fixe (il sera toujours rendu à l'infini)
    skybox.infiniteDistance = true;
    this.camera.attachControl();

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    ground.checkCollisions = true;

    this.player = MeshBuilder.CreateBox("player", { size: 1 }, scene);
    this.player.position = this.initialPlayerPosition ? this.initialPlayerPosition.clone() : new Vector3(0, 0.5, 0);
    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = Color3.Blue();
    this.player.material = playerMat;
    this.player.checkCollisions = true;

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

    const teleportA = MeshBuilder.CreateSphere("teleportA", { diameter: 1 }, scene);
    teleportA.position = new Vector3(5, 0.5, 5);
    const matA = new StandardMaterial("matA", scene);
    matA.diffuseColor = Color3.Green();
    teleportA.material = matA;
    this.teleportObjects.push(teleportA);

    const teleportB = MeshBuilder.CreateSphere("teleportB", { diameter: 1 }, scene);
    teleportB.position = new Vector3(-5, 0.5, -5);
    const matB = new StandardMaterial("matB", scene);
    matB.diffuseColor = Color3.Red();
    teleportB.material = matB;
    this.teleportObjects.push(teleportB);

    console.log(this.teleportObjects);
    return scene;
  }

  public update(): void {
    const delta = 0.1; // vitesse de déplacement
    if (this.inputMap["z"] || this.inputMap["ArrowUp"]) {
      this.player.position.z -= delta;
    }
    if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
      this.player.position.z += delta;
    }
    if (this.inputMap["q"] || this.inputMap["ArrowLeft"]) {
      this.player.position.x += delta;
    }
    if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
      this.player.position.x -= delta;
    }

    for (const teleport of this.teleportObjects) {
      const distance = Vector3.Distance(this.player.position, teleport.position);
      if (distance < 1) {
        console.log("Téléportation !");
        if (teleport.name === "teleportA") {
          this.sceneManager.changeScene(
            new SceneA(this.canvas, this.sceneManager, this.player.position, teleport.position)
          );
        } else if (teleport.name === "teleportB") {
          this.sceneManager.changeScene(
            new SceneB(this.canvas, this.sceneManager, this.player.position)
          );
        }
      }
    }
  }
}
