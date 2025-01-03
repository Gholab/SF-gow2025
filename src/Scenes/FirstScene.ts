import { Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export class FirstScene{
    scene: Scene;
    engine: Engine;
    constructor(private canvas: HTMLCanvasElement){
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene{
        const scene = new Scene(this.engine);

        const camera = new FreeCamera("camera", new Vector3(0, 1, 0), this.scene);
        camera.attachControl();
        
        const light = new HemisphericLight("light", new Vector3(0, 2, 0), this.scene);
        light.intensity = 0.7;

        const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, this.scene);
        ground.position = new Vector3(0, 0, 0);

        const box = MeshBuilder.CreateBox("box", {size: 1}, this.scene);
        box.position= new Vector3(0, 1, 2);

        return scene;
    }

}