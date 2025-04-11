// src/Scenes/BridgeScene.ts
import {
  Scene,
  FreeCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Texture,
  Vector2,
  Mesh,
  SpotLight,
  DirectionalLight,
  CubeTexture,
  HemisphericLight,
  PBRMaterial,
  PointLight,
  UniversalCamera
} from "@babylonjs/core";
import { WaterMaterial } from "@babylonjs/materials/water/waterMaterial";
import { AbstractScene } from "./AbstractScene";

export class BridgeScene extends AbstractScene {
  private camera!: FreeCamera;
  private bridge!: Mesh;
  private waterLeft!: Mesh;
  private waterRight!: Mesh;

  private light!: PointLight;

  protected async createScene(): Promise<Scene> {
    const scene = new Scene(this.engine);

    scene.gravity = new Vector3(0, -0.5, 0);
    scene.collisionsEnabled = true;

    // const assumedFramesPerSecond = 60;
    // const earthGravity = -9.81;
    // scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);

    // Ambiance : ciel entièrement noir
    scene.clearColor = new Color4(0, 0, 0, 1);

    // Ajout d'une lumière directionnelle pour éclairer le pont et l'eau
    // const light = new SpotLight("spotLight", new Vector3(0, -1, 0), scene);
    // this.light = new SpotLight("spotLight", new Vector3(-1, 1, -1), new Vector3(0, -1, 0), Math.PI / 2, 10, scene);

    // this.light.diffuse = new Color3(1, 1, 1);
    // this.light.specular = new Color3(0, 1, 0);
    // this.light.position = new Vector3(0, 50, 0);
    // this.light.intensity = 1.0;


    this.light = new PointLight("pointLight", new Vector3(0, 50, 0), scene);
    this.light.diffuse = new Color3(1, 1, 1);
    this.light.specular = new Color3(1, 1, 1); // ou 0, 1, 0 si tu veux garder le vert
    this.light.intensity = 10.0;
    this.light.range = 70;
    this.light.radius = 70;

    // scene.fogMode = Scene.FOGMODE_LINEAR; // Vous pouvez aussi essayer FOGMODE_EXP ou FOGMODE_EXP2 pour des effets exponentiels
    // scene.fogColor = new Color3(0, 0, 0);  // Couleur du brouillard (ici noir, en accord avec le ciel)
    // scene.fogStart = 30;                   // La distance à partir de laquelle le brouillard commence
    // scene.fogEnd = 50;



    // var skybox = Mesh.CreateBox("skyBox", 5000.0, scene);
    // var skyboxMaterial = new StandardMaterial("skyBox", scene);
    // skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.reflectionTexture = new CubeTexture("textures/space", scene);
    // skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    // skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    // skyboxMaterial.specularColor = new Color3(0, 0, 0);
    // skyboxMaterial.disableLighting = true;
    // skybox.material = skyboxMaterial;

    const skyboxSize = 1000;
    const skybox = MeshBuilder.CreateBox("skyBox", { size: skyboxSize }, scene);
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    // Remplacez "textures/skyboxClouds" par le chemin vers vos images (conformément à la convention de BabylonJS)
    skyboxMaterial.reflectionTexture = new CubeTexture("textures/space", scene, ["_px.png", "_py.png", "_pz.png", "_nx.png", "_ny.png", "_nz.png"],);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    skyboxMaterial.specularColor = new Color3(0, 0, 0);
    skyboxMaterial.emissiveColor = new Color3(0, 0, 0);
    skyboxMaterial.alpha = 0.5;


    // const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    // light.intensity = 0.15;



    // // add sun light
    // const sunLight = new DirectionalLight("sunLight", new Vector3(0, -1, 0), scene);
    // sunLight.position = new Vector3(0, 50, 0);
    // sunLight.intensity = 0.5;
    // const sunColor = new Color3(1, 1, 0);
    // sunLight.diffuse = sunColor;
    // sunLight.specular = sunColor;


    // Crée la caméra
    this.camera = new UniversalCamera("FirstPersonCamera", new Vector3(0, 10, -10), scene);
    this.camera.attachControl(this.canvas, true);

    // Active les collisions et la gravité sur la caméra
    this.camera.checkCollisions = true;
    this.camera.applyGravity = true;
    this.camera.ellipsoid = new Vector3(0.5, 1, 0.5); // "hitbox" de la caméra (taille de capsule)

    // Active les mouvements avec touches
    this.camera.keysUp.push(90); // Z
    this.camera.keysDown.push(83); // S
    this.camera.keysLeft.push(81); // Q
    this.camera.keysRight.push(68); // D

    // Mouvement
    this.camera.speed = 0.5;
    this.camera.angularSensibility = 500;
    this.camera.inertia = 0

    // Active les collisions sur le sol (à faire aussi pour les autres objets)

    // Variables pour le saut
    let isJumping = false;
    let jumpSpeed = 0.5;
    let verticalVelocity = 0;
    const gravity = -0.02;
    const jumpHeight = 1.0;

    scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime();

      if (isJumping) {
        verticalVelocity += gravity;
        this.camera.position.y += verticalVelocity;

        // Arrêt du saut si on touche le sol
        if (this.camera.position.y <= 2) {
          this.camera.position.y = 2;
          verticalVelocity = 0;
          isJumping = false;
        }
      }
    });

    // Détecte l’appui sur espace pour sauter
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" && !isJumping) {
        isJumping = true;
        verticalVelocity = jumpSpeed;
      }
    });



    // Caméra en vue à la première personne
    // this.camera = new FreeCamera("firstPersonCamera", new Vector3(0, 1, -5), scene);
    // this.camera.attachControl(this.canvas, true);
    // this.camera.speed = 10;
    // this.camera.inertia = 0.4;


    // Création du pont (pont blanc)
    const bridgeWidth = 1;
    const bridgeHeight = 0.3;
    const bridgeDepth = 100; // 100 m de long

    this.bridge = MeshBuilder.CreateBox("bridge", {
      width: bridgeWidth,
      height: bridgeHeight,
      depth: bridgeDepth
    }, scene);
    // Position : le pont s'étend de -50 à +50 en profondeur
    this.bridge.position = new Vector3(0, 0, 0);
    this.bridge.checkCollisions = true;


    // const bridgeMat = new PBRMaterial("bridgePBR", scene);
    // bridgeMat.albedoTexture = new Texture("textures/cement_arcing_pattern1_albedo.png", scene);
    // bridgeMat.ambientTexture = new Texture("textures/cement_arcing_pattern1_ao.png", scene);
    // bridgeMat.bumpTexture = new Texture("textures/cement_arcing_pattern1_Normal-ogl.png", scene);
    // bridgeMat.metallicTexture = new Texture("textures/cement_arcing_pattern1_Metallic.png", scene);
    // bridgeMat.metallic = 0; // ou adapte selon ton rendu voulu
    // bridgeMat.roughness = 0;
    // bridgeMat.useAmbientOcclusionFromMetallicTextureRed = true;

    // bridgeMat.albedoTexture.uScale = 100;
    // bridgeMat.albedoTexture.vScale = 1;

    // bridgeMat.useRoughnessFromMetallicTextureGreen = true;
    // bridgeMat.useMetallnessFromMetallicTextureBlue = true;

    // // bridgeMat.parallax = true;
    // bridgeMat.parallaxScaleBias = 0.05;
    // bridgeMat.microSurfaceTexture = new Texture("textures/cement_arcing_pattern1_Roughness.png", scene);
    // bridgeMat.useParallaxOcclusion = true;

    const bridgeMat = new StandardMaterial("bridgeMat", scene);
    bridgeMat.diffuseTexture = new Texture("textures/cement_arcing_pattern1_albedo.png", scene);
    // change albedo texture to a more white color
    bridgeMat.diffuseTexture.uScale = 100;
    bridgeMat.diffuseTexture.vScale = 1;

    // bridgeMat.ambientTexture = new Texture("textures/cement_arcing_pattern1_ao.png", scene);
    // bridgeMat.ambientTexture.uScale = 100;
    // bridgeMat.ambientTexture.vScale = 1;
    bridgeMat.bumpTexture = new Texture("textures/cement_arcing_pattern1_Normal-ogl.png", scene);
    bridgeMat.bumpTexture.uScale = 100;
    bridgeMat.bumpTexture.vScale = 1;

    bridgeMat.diffuseColor = new Color3(1, 1, 1);

    this.bridge.material = bridgeMat;

    // Création de l'eau sur les côtés du pont
    // const waterWidth = 50; // largeur de chaque plan d'eau
    // const waterDepth = bridgeDepth; // même profondeur que le pont

    // // Eau à gauche
    // this.waterLeft = MeshBuilder.CreateGround("waterLeft", {
    //   width: waterWidth,
    //   height: waterDepth
    // }, scene);
    // this.waterLeft.position = new Vector3(-(bridgeWidth / 2 ), -5, 0);


    // Eau à droite
    // this.waterRight = MeshBuilder.CreateGround("waterRight", {
    //   width: waterWidth,
    //   height: waterDepth
    // }, scene);
    // this.waterRight.position = new Vector3(bridgeWidth / 2 + waterWidth / 2, 0, 0);

    // Création du matériau d'eau pour animer le mouvement
    const waterMaterialLeft = new WaterMaterial("waterMatLeft", scene, new Vector2(512, 512));
    waterMaterialLeft.bumpTexture = new Texture("textures/waterbump.png", scene);
    waterMaterialLeft.windForce = 5;
    waterMaterialLeft.waveHeight = 0.2;
    // waterMaterialLeft.emissiveColor = new Color3(1, 1, 1);

    // Pour que l'eau soit visible, on utilise une très légère teinte sombre plutôt que du pur noir.
    waterMaterialLeft.waterColor = new Color3(0.2, 0.2, 0.2);
    waterMaterialLeft.colorBlendFactor = 1;
    waterMaterialLeft.bumpHeight = 0.5;
    // Activez l'éclairage pour que la lumière puisse créer des reflets et dynamiser l'eau
    waterMaterialLeft.disableLighting = false;

    // (Optionnel) Pour ajouter un reflet du pont sur l'eau, on peut ajouter le pont à la liste de rendu de réflexion :
    waterMaterialLeft.addToRenderList(this.bridge);

    // Dupliquer le matériau pour le côté droit
    const waterMaterialRight = waterMaterialLeft.clone("waterMatRight");

    // this.waterLeft.material = waterMaterialLeft;
    // this.waterRight.material = waterMaterialRight;

    return scene;
  }

  public update(): void {

    // light follow the camera
    // this.camera.getDirectionToRef(Vector3.Forward(), this.light.direction);
    // this.light.position.copyFrom(this.camera.position);
    // this.light.position.y += 50;
    this.light.position.x = this.camera.position.x
    this.light.position.z = this.camera.position.z
    // console.log(this.light.position);
    // this.light.position.y = Math.max(this.light.position.y, 50);
    // this.light.position.x = Math.max(this.light.position.x, 0);
    // this.light.position.z = Math.max(this.light.position.z, 0);
  }
}
