import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log("Canvas element not found");
    }

    // Initialize Babylon Engine and Scene
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    console.log("Babylon scene created");
    // Create a camera and attach controls
    const camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Add a hemispheric light
    new HemisphericLight("Light", new Vector3(0, 1, 0), scene);

    // Add a sphere
    MeshBuilder.CreateSphere("Sphere", { diameter: 1 }, scene);

    // Render the scene
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const resizeHandler = () => engine.resize();
    window.addEventListener("resize", resizeHandler);

    // Cleanup resources
    return () => {
      engine.dispose();
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default BabylonScene;
