<template>
  <div class="min-h-screen">
    <div class="surface-card p-4">
      <div class="mb-4">
        <div class="flex justify-content-between align-items-center">
          <h1 class="text-3xl font-bold">Device: {{ $route.params.id }}</h1>

          <div class="p-buttonset">
            <Button
              :class="{ 'p-button-secondary': !isRealTimeView }"
              @click="switchToRealTime"
              icon="pi pi-clock"
              label="Real-time"
            />
            <Button
              :class="{ 'p-button-secondary': isRealTimeView }"
              @click="switchToHistorical"
              icon="pi pi-history"
              label="Historical"
            />
          </div>
        </div>

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

      <div
        v-if="loading"
        class="flex align-items-center justify-content-center"
        style="height: 400px"
      >
        <i class="pi pi-spin pi-spinner text-3xl"></i>
      </div>

      <div
        v-else-if="error"
        class="flex align-items-center justify-content-center surface-danger p-3 border-round"
        style="height: 400px"
      >
        <i class="pi pi-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>

      <div
        v-show="!loading && !error"
        ref="mapContainer"
        class="w-full h-30rem border-round map-container"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
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
    const isRealTimeView = ref(true);
    const polyline = ref(null);
    const historicalMarkers = ref([]);
    const mapInitialized = ref(false);

    return {
      mapContainer,
      map,
      marker,
      loading,
      error,
      deviceData,
      updateInterval,
      isRealTimeView,
      polyline,
      historicalMarkers,
      mapInitialized,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLastData", "getDeviceLocations", "getError"]),
    deviceId() {
      return this.$route.params.id;
    },
  },
  methods: {
    formatDateTime(date, time) {
      const datetime = new Date(`${date}T${time}`);
      return datetime.toLocaleString();
    },

    async initializeMap() {
      if (!this.mapContainer || this.map || !this.mapInitialized) return;

      // Wait for the container to be visible and have dimensions
      await nextTick();

      // Create map instance
      this.map = L.map(this.mapContainer).setView([0, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      // Force a resize after a short delay
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          // If we have data, update the view
          if (this.deviceData) {
            const lat = parseFloat(this.deviceData.latitude);
            const lng = parseFloat(this.deviceData.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              this.map.setView([lat, lng], 15);
            }
          }
        }
      }, 250);
    },

    clearMapLayers() {
      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }
      if (this.polyline) {
        this.polyline.remove();
        this.polyline = null;
      }
      this.historicalMarkers.forEach((marker) => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      this.historicalMarkers = [];
    },

    async switchToRealTime() {
      if (this.isRealTimeView) return;
      this.isRealTimeView = true;
      this.clearMapLayers();
      await this.updateDeviceData();

      // Restart real-time updates
      if (this.updateInterval) clearInterval(this.updateInterval);
      this.updateInterval = setInterval(() => {
        this.updateDeviceData();
      }, 30000);
    },

    async switchToHistorical() {
      if (!this.isRealTimeView) return;
      this.isRealTimeView = false;
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      await this.displayHistoricalData();
    },

    createPopupContent(location, index) {
      // Parse the ISO timestamp into a Date object
      const date = new Date(location.timestamp);

      return `
        <div class="p-2">
          <div class="font-bold mb-2">Location ${index + 1}</div>
          <div>Time: ${date.toLocaleString()}</div>
        </div>
      `;
    },

    async displayHistoricalData() {
      try {
        this.loading = true;
        this.error = null;

        if (this.map) {
          this.clearMapLayers();
        }

        await this.$store.dispatch("fetchDeviceLocations", this.deviceId);
        const locations = this.getDeviceLocations(this.deviceId);

        if (!locations || locations.length === 0) {
          this.error = "No historical data available";
          return;
        }

        const coordinates = locations
          .map((loc) => {
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);
            if (isNaN(lat) || isNaN(lng)) {
              console.error("Invalid coordinates:", loc);
              return null;
            }
            return [lat, lng];
          })
          .filter((coord) => coord !== null);

        if (coordinates.length < 2) {
          this.error = "Not enough valid coordinates for route";
          return;
        }

        // Create polyline first
        this.polyline = new L.Polyline(coordinates, {
          color: "blue",
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
        });

        if (this.map && this.polyline) {
          this.polyline.addTo(this.map);
        }

        // Add markers for each location
        locations.forEach((loc, index) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.error("Invalid coordinates for marker:", loc);
            return;
          }

          const marker = new L.Marker([lat, lng], {
            icon: defaultIcon,
          });

          const popup = L.popup({
            maxWidth: 300,
            closeButton: true,
            autoClose: false,
          }).setContent(this.createPopupContent(loc, index));

          marker.bindPopup(popup);
          marker.addTo(this.map);
          this.historicalMarkers.push(marker);
        });

        if (this.polyline) {
          const bounds = this.polyline.getBounds();
          this.map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
          });
        }
      } catch (err) {
        this.error = "Failed to fetch or display historical data";
        console.error("Historical data error:", err);
      } finally {
        this.loading = false;
      }
    },

    async ensureMapInitialized() {
      if (!this.mapInitialized) {
        this.mapInitialized = true;
        await this.initializeMap();
      }
    },

    async updateDeviceData() {
      if (!this.isRealTimeView) return;

      try {
        this.error = null;
        this.loading = true;

        await this.$store.dispatch("fetchDeviceLastData", this.deviceId);
        this.deviceData = this.getDeviceLastData(this.deviceId);

        await this.ensureMapInitialized();

        if (this.deviceData && this.map) {
          const lat = parseFloat(this.deviceData.latitude);
          const lng = parseFloat(this.deviceData.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.error(
              "Invalid coordinates for real-time marker:",
              this.deviceData
            );
            return;
          }

          const popupContent = `
            <div class="p-2">
              <div class="font-bold mb-2">Device ${this.deviceId}</div>
              <div>Speed: ${this.deviceData.current_speed} km/h</div>
              <div>Status: ${this.deviceData.status}</div>
              <div>Battery: ${this.deviceData.voltage / 10}V</div>
            </div>
          `;

          if (!this.marker) {
            this.marker = new L.Marker([lat, lng], {
              icon: defaultIcon,
            });

            const popup = L.popup({
              maxWidth: 300,
              closeButton: true,
              autoClose: false,
            }).setContent(popupContent);

            this.marker.bindPopup(popup);
            this.marker.addTo(this.map);
          } else {
            this.marker.setLatLng([lat, lng]);
            this.marker.getPopup().setContent(popupContent);
          }

          this.map.setView([lat, lng], 15);
          this.marker.openPopup();
        }
      } catch (err) {
        this.error = "Failed to fetch device data";
        console.error("Real-time data error:", err);
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });

    if (this.mapContainer) {
      resizeObserver.observe(this.mapContainer);
    }

    await this.ensureMapInitialized();
    await this.updateDeviceData();

    this.updateInterval = setInterval(() => {
      this.updateDeviceData();
    }, 30000);

    // Clean up observer on component unmount
    onBeforeUnmount(() => {
      resizeObserver.disconnect();
    });
  },
  beforeUnmount() {
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

.p-buttonset .p-button {
  margin: 0;
}

.map-container {
  position: relative;
  min-height: 30rem;
}
</style>
