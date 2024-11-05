<template>
  <div>
    <Message
      v-if="errorMessage"
      severity="error"
      :closable="false"
      class="mb-3"
    >
      {{ errorMessage }}
    </Message>

    <div
      v-if="!errorMessage"
      :key="mapKey"
      ref="mapContainer"
      class="w-full h-30rem border-round map-container"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import L from "leaflet";
import { mapGetters } from "vuex";
import "leaflet/dist/leaflet.css";

// Define default marker icon
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
  name: "DeviceMap",
  props: {
    deviceData: {
      type: Object,
      default: null,
    },
    isRealTimeView: {
      type: Boolean,
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    displaySettings: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const mapContainer = ref(null);
    const map = ref(null);
    const marker = ref(null);
    const polyline = ref(null);
    const historicalMarkers = ref([]);
    const errorMessage = ref(null);
    const resizeObserver = ref(null);
    const isInitializing = ref(false);
    const mapKey = ref(0);

    const cleanupMap = async () => {
      // Clear all markers
      if (historicalMarkers.value.length) {
        historicalMarkers.value.forEach((marker) => {
          if (marker) marker.remove();
        });
        historicalMarkers.value = [];
      }

      if (marker.value) {
        marker.value.remove();
        marker.value = null;
      }

      if (polyline.value) {
        polyline.value.remove();
        polyline.value = null;
      }

      // Clean up resize observer
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
      }

      // Remove map instance
      if (map.value) {
        map.value.remove();
        map.value = null;
      }

      // Force DOM cleanup
      mapKey.value++;

      // Wait for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    };

    onBeforeUnmount(async () => {
      await cleanupMap();
    });

    return {
      mapContainer,
      map,
      marker,
      polyline,
      historicalMarkers,
      errorMessage,
      resizeObserver,
      isInitializing,
      mapKey,
      cleanupMap,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLocations"]),
  },
  methods: {
    async initializeMap() {
      if (this.isInitializing) {
        return false;
      }

      this.isInitializing = true;
      this.errorMessage = null;

      try {
        // Ensure complete cleanup
        await this.cleanupMap();

        // Wait for the next tick to ensure DOM is updated
        await this.$nextTick();

        if (!this.mapContainer) {
          throw new Error("Map container not found");
        }

        // Create new map instance
        this.map = L.map(this.mapContainer).setView([0, 0], 2);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(this.map);

        // Setup resize observer
        this.resizeObserver = new ResizeObserver(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        });

        this.resizeObserver.observe(this.mapContainer);

        // Force a redraw
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (this.map) {
          this.map.invalidateSize();
        }

        return true;
      } catch (error) {
        console.error("Map initialization error:", error);
        this.errorMessage = "Error initializing map. Please try again.";
        return false;
      } finally {
        this.isInitializing = false;
      }
    },

    createPopupContent(location, index) {
      const date = new Date(location.timestamp);
      return `
        <div class="p-2">
          <div class="font-bold mb-2">Location ${index + 1}</div>
          <div>Time: ${date.toLocaleString()}</div>
          <div>Speed: ${location.current_speed} km/h</div>
        </div>
      `;
    },

    filterLocationsByTimeAndLimit(locations) {
      if (!locations?.length) return [];

      const sortedLocations = [...locations].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      const timeFrameStart = new Date(
        Date.now() - this.displaySettings.timeFrame * 1000
      );

      const timeFilteredLocations = sortedLocations.filter(
        (location) => new Date(location.timestamp) >= timeFrameStart
      );

      return timeFilteredLocations.slice(0, this.displaySettings.dataPoints);
    },

    getValidCoordinates(locations) {
      return locations
        .map((loc) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);
          return !isNaN(lat) &&
            !isNaN(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
            ? [lat, lng]
            : null;
        })
        .filter((coord) => coord !== null);
    },

    async displayHistoricalData() {
      try {
        if (!this.map) return;

        await this.$store.dispatch("fetchDeviceLocations", this.deviceId);
        let locations = this.getDeviceLocations(this.deviceId);

        if (!locations?.length) {
          this.errorMessage = "No historical data available for this device";
          return;
        }

        locations = this.filterLocationsByTimeAndLimit(locations);
        if (!locations.length) {
          this.errorMessage = `No location data available within the selected time frame (${
            this.displaySettings.timeFrame / 60
          } minutes)`;
          return;
        }

        const coordinates = this.getValidCoordinates(locations);
        if (!coordinates.length) {
          this.errorMessage = "No valid coordinates found in the data";
          return;
        }

        // Clear existing markers and polylines
        this.historicalMarkers.forEach((marker) => marker.remove());
        this.historicalMarkers = [];
        if (this.polyline) {
          this.polyline.remove();
          this.polyline = null;
        }

        // Add polyline if we have multiple coordinates
        if (coordinates.length > 1) {
          this.polyline = L.polyline(coordinates, {
            color: "blue",
            weight: 3,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(this.map);
        }

        // Add markers if enabled
        if (this.displaySettings.displayAllMarkers) {
          locations.forEach((loc, index) => {
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = L.marker([lat, lng])
                .bindPopup(this.createPopupContent(loc, index))
                .addTo(this.map);
              this.historicalMarkers.push(marker);
            }
          });
        }

        // Set appropriate view
        if (this.polyline) {
          this.map.fitBounds(this.polyline.getBounds(), {
            padding: [50, 50],
            maxZoom: 15,
          });
        } else if (coordinates.length === 1) {
          this.map.setView(coordinates[0], 15);
        }
      } catch (error) {
        console.error("Historical data error:", error);
        this.errorMessage =
          "Error loading historical data. Please try again later.";
      }
    },

    updateRealTimeMarker() {
      if (!this.deviceData || !this.map) return;

      const lat = parseFloat(this.deviceData.latitude);
      const lng = parseFloat(this.deviceData.longitude);

      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        this.errorMessage =
          "Invalid coordinates received for real-time tracking";
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

      if (this.displaySettings.displayAllMarkers) {
        if (!this.marker) {
          this.marker = L.marker([lat, lng])
            .bindPopup(popupContent)
            .addTo(this.map);
        } else {
          this.marker.setLatLng([lat, lng]);
          this.marker.getPopup().setContent(popupContent);
        }
        this.marker.openPopup();
      }

      this.map.setView([lat, lng], 15);
    },

    async refreshMap() {
      this.errorMessage = null;

      // Wait for any pending initialization to complete
      if (this.isInitializing) {
        await new Promise((resolve) => {
          const checkInit = () => {
            if (!this.isInitializing) {
              resolve();
            } else {
              setTimeout(checkInit, 50);
            }
          };
          checkInit();
        });
      }

      const initialized = await this.initializeMap();
      if (!initialized) return;

      if (this.isRealTimeView) {
        if (this.deviceData) {
          await this.updateRealTimeMarker();
        } else {
          this.errorMessage = "This device hasn't updated its data recently";
        }
      } else {
        await this.displayHistoricalData();
      }
    },
  },
  watch: {
    deviceData: {
      handler(newData) {
        if (newData && this.isRealTimeView && this.map) {
          this.updateRealTimeMarker();
        }
      },
      deep: true,
    },
    displaySettings: {
      handler() {
        this.refreshMap();
      },
      deep: true,
    },
    isRealTimeView: {
      handler() {
        this.refreshMap();
      },
    },
  },
  async mounted() {
    await this.refreshMap();
  },
};
</script>

<style scoped>
.leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.map-container {
  position: relative;
  min-height: 30rem;
}
</style>
