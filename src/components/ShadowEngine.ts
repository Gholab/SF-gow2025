import { DirectionalLight, FreeCamera, Mesh, Scene, ShadowGenerator, SSAO2RenderingPipeline, Vector3 } from "@babylonjs/core";

export class ShadowEngine {
  private shadowGenerator: ShadowGenerator;
  constructor(scene: Scene, camera: FreeCamera) {

    const dirLight = new DirectionalLight("dirLight", new Vector3(-0.5, -1, -0.5), scene);
    dirLight.position = new Vector3(10, 20, 10);
    dirLight.intensity = 1.0;

    this.shadowGenerator = new ShadowGenerator(1024, dirLight);
    this.shadowGenerator.useExponentialShadowMap = true;
    this.shadowGenerator.darkness = 0.7;
    this.shadowGenerator.blurKernel = 100;
    this.shadowGenerator.contactHardeningLightSizeUVRatio = 0.02;


    var ssao = new SSAO2RenderingPipeline("ssao", scene, {
      ssaoRatio: .5, // Ratio of the SSAO post-process, in a lower resolution
      blurRatio: 1.0
    });
    // ssao.fallOff = 0.000002; // Réduire l'atténuation pour un effet plus réaliste
    // ssao.area = 0.5;       // Ajuster la zone d'effet pour mieux capter les ombres
    // ssao.radius = 0.00005;   // Augmenter légèrement le rayon pour mieux cerner les objets
    // ssao.totalStrength = 1; // Augmenter la force de l'effet
    // ssao.base = 0.3;       // Réduire légèrement la base pour éviter d'éclaircir les ombres
    // ssao.textureSamples = 4;
    ssao.samples = 32;
    // ssao.radius = 0.5;
    ssao.totalStrength = 1.1;
    // ssao.minZAspect = 1;
    ssao.expensiveBlur = true;
    // ssao.base = 0.1;
    // ssao.maxZ = this.scene.activeCamera?.maxZ;

    // Attach camera to SSAO render pipeline
    scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);

  }

  addShadowCaster(mesh: Mesh) {
    this.shadowGenerator.addShadowCaster(mesh);
  }
}
