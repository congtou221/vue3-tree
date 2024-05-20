<template>
  <sandbox>
    <Vue3Tree />
  </sandbox>
</template>

<script>
import { Sandbox } from "component-fixture";
import "font-awesome/css/font-awesome.css";
import "component-fixture/dist/ComponentFixture.css";
import Vue3Tree from "@/components/Vue3TreeComponent.vue";

export default {
  name: "App",
  components: {
    Sandbox,
    Vue3Tree,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
