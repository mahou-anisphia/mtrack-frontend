<template>
  <div class="min-h-screen">
    <div class="surface-card p-4">
      <div class="mb-4">
        <h1 class="text-3xl font-bold">Device: {{ $route.params.id }}</h1>
      </div>

      <!-- Map Container -->
      <div id="map" class="w-full h-30rem border-round"></div>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
  name: "Device",
  data() {
    return {
      map: null,
    };
  },
  mounted() {
    // Initialize Leaflet map
    this.map = L.map("map").setView([0, 0], 2);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    // Optional: Add a marker example
    // L.marker([0, 0]).addTo(this.map);
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
};
</script>

<style>
#map {
  min-height: 400px;
  z-index: 1; /* Ensure proper stacking with PrimeVue components */
}

/* Required Leaflet styles */
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
