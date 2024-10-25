<template>
  <div
    ref="mapContainer"
    class="w-full h-30rem border-round map-container"
  ></div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import L from "leaflet";
import { mapGetters } from "vuex";
import "leaflet/dist/leaflet.css";

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
    const mapInitialized = ref(false);

    return {
      mapContainer,
      map,
      marker,
      polyline,
      historicalMarkers,
      mapInitialized,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLocations"]),
  },
  methods: {
    async initializeMap() {
      // Remove existing map if it exists
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      if (!this.mapContainer || !this.mapInitialized) return;

      this.map = L.map(this.mapContainer).setView([0, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      // Reset all layer references
      this.marker = null;
      this.polyline = null;
      this.historicalMarkers = [];

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
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
      if (!locations || locations.length === 0) return [];

      // Sort locations by timestamp
      const sortedLocations = locations.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      // Filter by time frame
      const currentTime = new Date();
      const timeFrameStart = new Date(
        currentTime - this.displaySettings.timeFrame * 1000
      );

      const timeFilteredLocations = sortedLocations.filter((location) => {
        const locationTime = new Date(location.timestamp);
        return locationTime >= timeFrameStart;
      });

      // If we have fewer locations than requested data points, return all available locations
      if (timeFilteredLocations.length <= this.displaySettings.dataPoints) {
        return timeFilteredLocations;
      }

      // Otherwise, limit by data points
      return timeFilteredLocations.slice(0, this.displaySettings.dataPoints);
    },

    getValidCoordinates(locations) {
      return locations
        .map((loc) => {
          const lat = parseFloat(loc.latitude);
          const lng = parseFloat(loc.longitude);
          return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
        })
        .filter((coord) => coord !== null);
    },

    async displayHistoricalData() {
      try {
        await this.$store.dispatch("fetchDeviceLocations", this.deviceId);
        let locations = this.getDeviceLocations(this.deviceId);

        if (!locations || locations.length === 0) {
          throw new Error("No historical data available");
        }

        // Filter locations based on settings
        locations = this.filterLocationsByTimeAndLimit(locations);

        if (locations.length === 0) {
          throw new Error("No data points within the specified time frame");
        }

        const coordinates = this.getValidCoordinates(locations);

        if (coordinates.length === 0) {
          throw new Error("No valid coordinates found in the data");
        }

        // Create polyline if we have at least one coordinate
        if (coordinates.length >= 1) {
          this.polyline = new L.Polyline(coordinates, {
            color: "blue",
            weight: 3,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(this.map);
        }

        // Add markers only if displayAllMarkers is true
        if (this.displaySettings.displayAllMarkers) {
          locations.forEach((loc, index) => {
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              const marker = new L.Marker([lat, lng])
                .bindPopup(this.createPopupContent(loc, index))
                .addTo(this.map);
              this.historicalMarkers.push(marker);
            }
          });
        }

        // If we have a polyline, fit bounds to it
        if (this.polyline) {
          this.map.fitBounds(this.polyline.getBounds(), {
            padding: [50, 50],
            maxZoom: 15,
          });
        }
        // If we have only one coordinate, center on it
        else if (coordinates.length === 1) {
          this.map.setView(coordinates[0], 15);
        }
      } catch (err) {
        console.error("Historical data error:", err);
        throw err;
      }
    },

    updateMarker() {
      if (!this.deviceData || !this.map) return;

      const lat = parseFloat(this.deviceData.latitude);
      const lng = parseFloat(this.deviceData.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

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
          this.marker = new L.Marker([lat, lng])
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
  },
  watch: {
    deviceData: {
      handler(newData) {
        if (newData && this.isRealTimeView) {
          this.updateMarker();
        }
      },
      deep: true,
    },
    displaySettings: {
      handler() {
        this.clearMapLayers();
        if (this.isRealTimeView) {
          this.updateMarker();
        } else {
          this.displayHistoricalData();
        }
      },
      deep: true,
    },
    isRealTimeView: {
      async handler(newValue) {
        // Completely reset the map when switching modes
        await this.initializeMap();

        if (newValue) {
          if (this.deviceData) {
            this.updateMarker();
          }
        } else {
          this.displayHistoricalData();
        }
      },
      immediate: true,
    },
  },
  async mounted() {
    this.mapInitialized = true;
    await this.initializeMap();

    const resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });

    if (this.mapContainer) {
      resizeObserver.observe(this.mapContainer);
    }

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
    });
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
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
