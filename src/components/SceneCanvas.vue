<!-- src/components/SceneCanvas.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { MainScene } from '../Scenes/MainScene';
import { SceneManager } from '../SceneManager';

onMounted(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('Canvas not found');
  }
  const sceneManager = new SceneManager();
  sceneManager.changeScene(new MainScene(canvas, sceneManager));
});
</script>

<template>
  <div>
    <canvas style="width: 100%; height: 100vh;"></canvas>
  </div>
</template>
