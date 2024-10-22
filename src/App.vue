<!-- src/App.vue -->
<template>
  <div class="min-h-screen">
    <Navbar v-if="showNavbar" />
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Navbar from "./components/Navbar.vue";

const route = useRoute();

// Compute whether to show navbar based on current route
const showNavbar = computed(() => {
  return route.name !== "Login";
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Raleway&family=Work+Sans:ital,wght@0,300;0,400;1,200;1,300&display=swap");

* {
  font-family: "Raleway", sans-serif;
  font-family: "Work Sans", sans-serif;
}

/* Add some global spacing to account for navbar */
.min-h-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Ensure main content takes remaining space */
.router-view-container {
  flex: 1;
  width: 100%;
}
</style>
