import { AbstractScene } from "./AbstractScene";
import cannon from "cannon";
window.CANNON = cannon;

import {
  Scene,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
  AbstractMesh,
  Animation,
  EasingFunction,
  CircleEase,
  Ray,
  CannonJSPlugin,
  PhysicsImpostor,
  Mesh,
  Texture
} from "@babylonjs/core";
import { SceneManager } from "../SceneManager";
import { MainScene } from "./MainScene";
import { firstPersonCamera } from "../components/FirstPersonCamera";
import { ShadowEngine } from "../components/ShadowEngine";

export class SceneA extends AbstractScene {
  private camera!: FreeCamera;
  private initialPlayerPosition: Vector3;
  private returnPosition?: Vector3;
  private verticalVelocity: number = 0;
  // Valeur initiale de saut (à ajuster en fonction de l'effet désiré)
  private readonly jumpForce: number = 0.3;
  // Gravité exprimée en unités/s²
  private readonly gravity: number = -9.81;

  constructor(
    canvas: HTMLCanvasElement,
    private sceneManager: SceneManager,
    initialPlayerPosition?: Vector3,
    returnPosition?: Vector3,
  ) {
    super(canvas);
    this.returnPosition = new Vector3(returnPosition?.x ?? 0, returnPosition?.y ?? 0, (returnPosition?.z ?? 0) - 1);
    this.initialPlayerPosition = initialPlayerPosition
      ? initialPlayerPosition.clone()
      : new Vector3(0, 0.5, 0);
  }

  private isOnGround(): boolean {
    return this.camera.position.y <= 1.01;
  }

  protected async createScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    scene.onPointerDown = (evt) => {
      if (evt.button === 0) this.engine.enterPointerlock();
      if (evt.button === 1) this.engine.exitPointerlock();
    };

    this.camera = firstPersonCamera(this.scene, new Vector3(0, 6, 0));


    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);


    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var box = MeshBuilder.CreateBox("crate", { size: 2 }, scene);
    box.material = new StandardMaterial("Mat", scene);
    box.material.diffuseTexture = new Texture("textures/crate.png", scene);
    box.material.diffuseTexture.hasAlpha = true;
    box.position = new Vector3(5, 5, 4);
    box.pushable = true;

    const shadowEngine = new ShadowEngine(scene, this.camera);


    shadowEngine.addShadowCaster(box);


    var alpha = Math.PI;
    let ignoreRotation = false;

    this.camera.onViewMatrixChangedObservable.add(() => {
      // Si la rotation est en cours (programmée), on ignore l'événement
      if (ignoreRotation) return;

      // Indiquer que l'on va modifier la caméra par programmation
      ignoreRotation = true;

      // Appliquer la rotation souhaitée
      this.camera.rotation.z += Math.cos(alpha) / 800;
      alpha += 0.1;

      // Remettre à false dès que possible (ici on utilise setTimeout pour laisser le temps à la mise à jour)
      setTimeout(() => {
        ignoreRotation = false;
      }, 0);
    });

    // scene.registerBeforeRender(() => {
    //   // this.camera.position.y += Math.sin(alpha) / 30;
    //   // camparent.rotation.z += Math.cos(alpha) / 1000;
    //   this.camera.rotation.z += Math.cos(alpha) / 800;
    //   alpha += .1;
    //   // animate();
    //   // beforeRenderFunction();

    // });


    const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    ground.checkCollisions = true;


    // var gravityVector = new Vector3(0,-9.81, 0);
    // var physicsPlugin = new CannonJSPlugin();
    scene.enablePhysics();

    box.checkCollisions = true;

    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass: 10, restitution: 0.1 }, scene);


    let jumping = false;
    let jumpBtnPressed = false;
    let jumpTimestamp = 0;
    let jumpThrottling = 500;

    const keyboardHandler = (e) => {
      if (e.event.keyCode == 32) {
        if (e.type === 1) {
          console.log('jump');
          jumpBtnPressed = true;
          if (jumping !== true && (new Date()).valueOf() - jumpTimestamp > jumpThrottling) {
            jumpTimestamp = (new Date()).valueOf();
            const animations = [];
            let a = new Animation("a", "position.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

            // Animation keys
            let keys = [];
            keys.push({ frame: 0, value: this.camera.position.y });
            keys.push({ frame: 20, value: this.camera.position.y + 6 });
            a.setKeys(keys);

            let easingFunction = new CircleEase();
            easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
            a.setEasingFunction(easingFunction);

            animations.push(a);
            console.log('jumping');
            scene.beginAnimation(this.camera, 0, 20, false);
            jumping = true;
          }
        } else {
          jumpBtnPressed = false;
        }
      }
      // 'c' for croach.
      if (e.event.keyCode == 67) {
        if (e.type === 1) {
          this.camera.ellipsoid.y = 1;
        } else {
          this.camera.position.y += 2;
          this.camera.ellipsoid.y = 2;
        }
      }
    }

    const checkOnGround = () => {
      const origin = this.camera.position;
      const targetPoint = origin.clone();
      targetPoint.y -= 1;
      const direction = targetPoint.subtract(origin);
      direction.normalize();
      const length = 4.1;
      const ray = new Ray(origin, direction, length);

      const hit = scene.pickWithRay(ray);
      if (hit?.pickedMesh && !jumpBtnPressed) {
        jumping = false;
      }
    }

    scene.onKeyboardObservable.add(keyboardHandler.bind(this.camera));
    scene.onBeforeRenderObservable.add(checkOnGround);

    const teleportMain = MeshBuilder.CreateSphere("teleportMain", { diameter: 1 }, scene);
    teleportMain.position = new Vector3(0, 0.5, 10);
    const matMain = new StandardMaterial("matMain", scene);
    matMain.diffuseColor = Color3.Yellow();
    teleportMain.material = matMain;

    scene.registerBeforeRender(() => {
      // Cette ligne permet d'appliquer la gravité même si aucun input n'est présent
      this.camera._collideWithWorld(Vector3.Zero());

      // const deltaTime = this.engine.getDeltaTime() / 1000;

      // // Si la caméra n'est pas au sol, on applique la gravité
      // if (!this.isOnGround()) {
      //   this.verticalVelocity += this.gravity * deltaTime;
      // } else {
      //   // Si la caméra est au sol, on s'assure que la vitesse verticale soit nulle
      //   this.verticalVelocity = 0;
      // }

      // // Calcul du déplacement vertical à appliquer
      // const displacement = new Vector3(0, this.verticalVelocity * deltaTime, 0);

      // // Appliquer le déplacement en prenant en compte les collisions
      // this.camera._collideWithWorld(displacement);
    });

    return scene;
  }

  public update(): void {

    this.camera.onCollide = (collidedMesh: AbstractMesh) => {
      console.log("Collided with", collidedMesh.name);


    };

    const teleport = this.scene.getMeshByName("teleportMain");
    if (teleport) {
      const cameraPositionAdjusted = this.camera.position.clone();
      cameraPositionAdjusted.y -= 1;
      const distance = Vector3.Distance(cameraPositionAdjusted, teleport.position);
      if (distance < 1) {
        this.sceneManager.changeScene(
          new MainScene(this.canvas, this.sceneManager, this.returnPosition)
        );
      }
    }
  }
}
