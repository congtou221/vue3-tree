<template>
  <div id="app">
    <div
      ref="draggable"
      @mousedown="startDrag"
      @mouseup="stopDrag"
      :style="{ transform: scaleTransform }"
    >
      Drag Me
    </div>
    <div ref="dragPreview" v-if="isDragging" class="drag-preview"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const isDragging = ref(false);
let scaleTransform = "";
let initialMouseX = 0;
let initialMouseY = 0;
let initialWidth = 0;
let initialHeight = 0;
const draggable = ref(null);
const dragPreview = ref(null);

onMounted(() => {
  initialWidth = draggable.value.offsetWidth;
  initialHeight = draggable.value.offsetHeight;
});

function startDrag(event) {
  event.preventDefault();
  isDragging.value = true;

  initialMouseX = event.clientX;
  initialMouseY = event.clientY;

  const rect = draggable.value.getBoundingClientRect();
  dragPreview.value.style.width = `${rect.width}px`;
  dragPreview.value.style.height = `${rect.height}px`;

  dragPreview.value.style.left = `${event.clientX - rect.left}px`;
  dragPreview.value.style.top = `${event.clientY - rect.top}px`;

  dragPreview.value.style.display = "block";
  scaleTransform = `translate(${event.clientX - initialMouseX}px, ${event.clientY - initialMouseY}px) scale(0.5)`;
}

function stopDrag() {
  isDragging.value = false;
  dragPreview.value.style.display = "none";
  scaleTransform = "";
}

onBeforeUnmount(() => {
  dragPreview.value.style.display = "none";
});
</script>

<style scoped>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.draggable {
  width: 100px;
  height: 100px;
  background-color: #f00;
  text-align: center;
  line-height: 100px;
  color: white;
  cursor: move;
}

.drag-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background-color: #f00;
  opacity: 0.5;
  transform-origin: top left;
  z-index: 9999;
  pointer-events: none;
}
</style>
