<!-- // components/DeviceMap.vue -->
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
      if (!this.mapContainer || this.map || !this.mapInitialized) return;

      this.map = L.map(this.mapContainer).setView([0, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

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

    async displayHistoricalData() {
      try {
        await this.$store.dispatch("fetchDeviceLocations", this.deviceId);
        let locations = this.getDeviceLocations(this.deviceId);

        if (!locations || locations.length === 0) {
          throw new Error("No historical data available");
        }

        locations = locations.sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });

        const coordinates = locations
          .map((loc) => {
            const lat = parseFloat(loc.latitude);
            const lng = parseFloat(loc.longitude);
            return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
          })
          .filter((coord) => coord !== null);

        if (coordinates.length < 2) {
          throw new Error("Not enough valid coordinates for route");
        }

        this.polyline = new L.Polyline(coordinates, {
          color: "blue",
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1,
        }).addTo(this.map);

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

        this.map.fitBounds(this.polyline.getBounds(), {
          padding: [50, 50],
          maxZoom: 15,
        });
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

      if (!this.marker) {
        this.marker = new L.Marker([lat, lng])
          .bindPopup(popupContent)
          .addTo(this.map);
      } else {
        this.marker.setLatLng([lat, lng]);
        this.marker.getPopup().setContent(popupContent);
      }

      this.map.setView([lat, lng], 15);
      this.marker.openPopup();
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
