
<script setup lang="ts">
import { onMounted } from 'vue'
import { FirstScene } from '../Scenes/FirstScene';
onMounted(()=>
{
  const canvas = document.querySelector('canvas');
  if(canvas === null)
  {
    throw new Error('Canvas not found');
  }
  new FirstScene(canvas);
})
</script>

<template>
  <div>
    <canvas></canvas>
  </div>
</template>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block; 
}

</style>
