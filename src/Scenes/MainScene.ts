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
  KeyboardEventTypes,
  CubeTexture,
  Texture,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Matrix,
  NodeMaterial,
} from "@babylonjs/core";
import { SceneManager } from "../SceneManager";
import { SceneA } from './SceneA';
import { SceneB } from "./SceneB";
import { Staircase } from "../components/Staircase";
import HavokPhysics from '@babylonjs/havok'
import { Basin } from "../components/Basin";
import { ShadowEngine } from "../components/ShadowEngine";
import { Mirror } from "../components/Mirror";


export class MainScene extends AbstractScene {
  private camera: FreeCamera | undefined;
  private player!: Mesh;
  private playerAggregate!: PhysicsAggregate;
  private teleportObjects: Mesh[] = [];
  private inputMap: { [key: string]: boolean } = {};
  private initialPlayerPosition: Vector3 = new Vector3(0, 6, 4);
  private shadowEngine!: ShadowEngine;

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

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);
    // Active la physique avec une gravité (ici 9.81 en Y négatif)
    scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);



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

    //
    // skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    // skyboxMaterial.specularColor = new Color3(0, 0, 0);

    // skybox.infiniteDistance = true;


    var blade = MeshBuilder.CreateGround("blade", { width: 1, height: 1 }, scene);
    blade.rotation.x = Math.PI * 0.5;
    blade.bakeCurrentTransformIntoVertices();

    NodeMaterial.ParseFromSnippetAsync("#8WH2KS#22", scene).then((nodeMaterial) => {
      blade.material = nodeMaterial;
      nodeMaterial.backFaceCulling = false;
    });

    var instanceCount = 40000;
    var m = Matrix.Identity();
    let matricesData = new Float32Array(16 * instanceCount);

    var index = 0;
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const newMatrix = m.clone();
        newMatrix.setTranslation(new Vector3(
          (x + Math.cos((x + y) * 356.11)) * 0.5 - 10,
          0,
          // (Math.cos((x+y) * 0.1) * 0.3 + 0.3) + Math.cos((x+y) * 0.03) * 4 + 2 + Math.sin(y *0.009) * 10 + Math.random(),
          (y + Math.cos((x - y) * 793.14)) * 0.5 - 10));
        newMatrix.copyToArray(matricesData, index * 16);
        index++;
      }
    }

    blade.thinInstanceSetBuffer("matrix", matricesData, 16);



    this.camera = new FreeCamera("MainCamera", new Vector3(0, 10, 10), scene);
    this.camera.setTarget(new Vector3(0, 0, 0));
    this.camera.attachControl();


    this.shadowEngine = new ShadowEngine(scene, this.camera);


    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.15;

    var boxMaterial = new StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseTexture = new Texture("textures/ground.jpg", scene);
    boxMaterial.specularColor = Color3.Black();
    boxMaterial.emissiveColor = Color3.White();

    const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    // const shadowMat = new ShadowOnlyMaterial("shadowMat", scene);
    // ground.material = shadowMat;
    // ground.material = boxMaterial;
    const groundMaterial = new StandardMaterial("groundMaterial", scene);
    // groundMaterial.diffuseTexture = new Texture("textures/tiles.jpg", scene);
    // (groundMaterial.diffuseTexture as Texture).uScale = 10;
    // (groundMaterial.diffuseTexture as Texture).vScale = 10;
    groundMaterial.diffuseColor = new Color3(1, 1, 1);
    groundMaterial.alpha = 0.5; // Ajustez selon l'effet désiré
    ground.material = groundMaterial;
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);


    const basin = new Basin(scene, skybox);
    basin.create(new Vector3(3, 0.5, 3));



    const staircase1 = new Staircase(scene);
    staircase1.create(new Vector3(0, 0, 0));
    this.shadowEngine.addShadowCaster(staircase1.getMesh()!);


    const myMirror = new Mirror(scene, 6, 4);
    myMirror.create(new Vector3(0, 2, 0));




    this.player = MeshBuilder.CreateBox("player", { size: 1 }, scene);
    this.player.position = this.initialPlayerPosition ? this.initialPlayerPosition.clone() : new Vector3(0, 0.5, 0);
    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = Color3.Blue();
    this.player.material = playerMat;
    this.player.checkCollisions = true;

    this.playerAggregate = new PhysicsAggregate(this.player, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);


    this.shadowEngine.addShadowCaster(this.player);

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
    const speed = 5;
    const jumpSpeed = 8;

    let moveDirection = new Vector3(0, 0, 0);
    if (this.inputMap["z"] || this.inputMap["ArrowUp"]) {
      moveDirection.z -= 1;
    }
    if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
      moveDirection.z += 1;
    }
    if (this.inputMap["q"] || this.inputMap["ArrowLeft"]) {
      moveDirection.x += 1;
    }
    if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
      moveDirection.x -= 1;
    }

    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      moveDirection.scaleInPlace(speed);
    }

    // Récupérer la vélocité actuelle du joueur (via son imposteur physique)
    const currentVelocity = this.playerAggregate.body.getLinearVelocity();

    // Pour conserver la vélocité verticale déjà appliquée par la physique (gravité)
    // On la stocke dans une variable que l'on pourra éventuellement modifier pour le saut
    let newVerticalVelocity = currentVelocity.y;

    // Si la touche espace est pressée et que le joueur semble être au sol,
    // par exemple en vérifiant que la composante verticale est très faible :
    if (this.inputMap[" "] && Math.abs(currentVelocity.y) < 0.1) {
      // Déclencher le saut en fixant la vitesse verticale
      newVerticalVelocity = jumpSpeed;
    }

    // Composer la nouvelle vélocité en conservant le mouvement horizontal calculé et la composante verticale (mise à jour ou non)
    const newVelocity = new Vector3(moveDirection.x, newVerticalVelocity, moveDirection.z);

    // Appliquer la nouvelle vélocité via l'imposteur physique
    this.playerAggregate.body.setLinearVelocity(newVelocity);


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
