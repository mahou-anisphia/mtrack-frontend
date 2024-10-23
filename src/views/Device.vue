<template>
  <div class="min-h-screen">
    <div class="surface-card p-4">
      <div class="mb-4">
        <h1 class="text-3xl font-bold">Device: {{ $route.params.id }}</h1>

        <!-- Device Info Panel -->
        <div v-if="deviceData" class="mb-4">
          <div class="grid">
            <div class="col-12 md:col-4">
              <div class="text-500 mb-2">Last Updated</div>
              <div>
                {{ formatDateTime(deviceData.gps_date, deviceData.gps_time) }}
              </div>
            </div>
            <div class="col-12 md:col-4">
              <div class="text-500 mb-2">Speed</div>
              <div>{{ deviceData.current_speed }} km/h</div>
            </div>
            <div class="col-12 md:col-4">
              <div class="text-500 mb-2">Status</div>
              <div class="capitalize">
                {{ deviceData.status.replace("_", " ") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex align-items-center justify-content-center"
        style="height: 400px"
      >
        <i class="pi pi-spin pi-spinner text-3xl"></i>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex align-items-center justify-content-center surface-danger p-3 border-round"
        style="height: 400px"
      >
        <i class="pi pi-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>

      <!-- Map Container -->
      <div
        v-show="!loading && !error"
        ref="mapContainer"
        class="w-full h-30rem border-round"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { mapGetters } from "vuex";

const defaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;
export default {
  name: "Device",
  setup() {
    const mapContainer = ref(null);
    const map = ref(null);
    const marker = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const deviceData = ref(null);
    const updateInterval = ref(null);

    return {
      mapContainer,
      map,
      marker,
      loading,
      error,
      deviceData,
      updateInterval,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLastData", "getError"]),
    deviceId() {
      return this.$route.params.id;
    },
  },
  methods: {
    formatDateTime(date, time) {
      const datetime = new Date(`${date}T${time}`);
      return datetime.toLocaleString();
    },

    initializeMap() {
      if (!this.mapContainer || this.map) return;

      // Initialize Leaflet map
      this.map = L.map(this.mapContainer).setView([0, 0], 2);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      // Force a map resize after initialization
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    },

    async updateDeviceData() {
      try {
        this.error = null;
        this.loading = true;

        // Call the Vuex action to fetch device data
        await this.$store.dispatch("fetchDeviceLastData", this.deviceId);
        this.deviceData = this.getDeviceLastData(this.deviceId);

        if (this.deviceData) {
          const lat = parseFloat(this.deviceData.latitude);
          const lng = parseFloat(this.deviceData.longitude);

          // Initialize map if not already done
          if (!this.map) {
            this.initializeMap();
          }

          // Update marker position
          if (this.marker) {
            this.marker.setLatLng([lat, lng]);
          } else {
            this.marker = L.marker([lat, lng]).addTo(this.map);
          }

          // Center map on marker
          this.map.setView([lat, lng], 15);

          // Update popup content
          this.marker
            .bindPopup(
              `
            <div class="p-2">
              <div class="font-bold mb-2">Device ${this.deviceId}</div>
              <div>Speed: ${this.deviceData.current_speed} km/h</div>
              <div>Status: ${this.deviceData.status}</div>
              <div>Battery: ${this.deviceData.voltage / 10}V</div>
            </div>
          `
            )
            .openPopup();
        }
      } catch (err) {
        this.error = "Failed to fetch device data";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    await this.$nextTick();
    await this.updateDeviceData();

    // Set up auto-refresh every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updateDeviceData();
    }, 30000);
  },
  beforeUnmount() {
    // Clean up
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
};
</script>

<style>
.leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.capitalize {
  text-transform: capitalize;
}
</style>
