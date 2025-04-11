import {
  Scene,
  Vector3,
  FreeCamera,
} from "@babylonjs/core";

export const firstPersonCamera = (scene: Scene, initialPosition: Vector3): FreeCamera => {
  const camera = new FreeCamera("camera", initialPosition, scene);
  camera.attachControl();

  camera.applyGravity = true;
  camera.checkCollisions = true;


  camera.ellipsoid = new Vector3(1, 1, 1);
  camera.inertia = 0



  camera.minZ = 0.45;
  camera.fov = 0.9;
  camera.speed = 1.75;
  camera.angularSensibility = 1000;

  camera.keysUp.push(90);
  camera.keysLeft.push(81);
  camera.keysDown.push(83);
  camera.keysRight.push(68);

  return camera;
}
