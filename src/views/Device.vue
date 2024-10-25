<template>
  <div class="min-h-screen">
    <div class="surface-card p-4">
      <!-- Header and Device Info Block -->
      <div class="device-header-info-block">
        <DeviceHeader
          :deviceId="deviceId"
          :currentSettings="displaySettings"
          @settings-changed="handleDisplaySettingsChange"
        />
        <DeviceInfo v-if="deviceData" :deviceData="deviceData" />
      </div>

      <!-- Loading or Error handling -->
      <LoadingSpinner v-if="loading" />
      <ErrorDisplay v-else-if="error" :error="error" />

      <!-- Device Map Block -->
      <DeviceMap
        v-show="!loading && !error"
        ref="deviceMap"
        :deviceData="deviceData"
        :isRealTimeView="isRealTimeView"
        :deviceId="deviceId"
        :displaySettings="displaySettings"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { mapGetters } from "vuex";
import DeviceHeader from "../components/DeviceHeader.vue";
import DeviceInfo from "../components/DeviceInfo.vue";
import DeviceMap from "../components/DeviceMap.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorDisplay from "../components/ErrorDisplay.vue";

export default {
  name: "DeviceTracker",
  components: {
    DeviceHeader,
    DeviceInfo,
    DeviceMap,
    LoadingSpinner,
    ErrorDisplay,
  },
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const deviceData = ref(null);
    const updateInterval = ref(null);
    const isRealTimeView = ref(true);
    const displaySettings = ref({
      displayMode: "last",
      timeFrame: 300,
      dataPoints: 100,
      displayAllMarkers: false,
    });

    return {
      loading,
      error,
      deviceData,
      updateInterval,
      isRealTimeView,
      displaySettings,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLastData", "getError"]),
    deviceId() {
      return this.$route.params.id;
    },
  },
  watch: {
    "displaySettings.displayMode": {
      handler(newMode) {
        console.log("Display mode changed:", newMode);
        if (newMode === "last") {
          this.switchToRealTime();
        } else {
          this.switchToHistorical();
        }
      },
    },
  },
  methods: {
    handleDisplaySettingsChange(newSettings) {
      console.log("Device page received new settings:", newSettings);
      this.displaySettings = { ...newSettings };

      // You might want to store these settings in localStorage or Vuex
      localStorage.setItem(
        `device-${this.deviceId}-settings`,
        JSON.stringify(newSettings)
      );
    },
    async switchToRealTime() {
      if (this.isRealTimeView) return;
      this.isRealTimeView = true;
      this.$refs.deviceMap.clearMapLayers();
      await this.updateDeviceData();
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
      await this.$refs.deviceMap.displayHistoricalData();
    },
    async updateDeviceData() {
      if (!this.isRealTimeView) return;
      try {
        this.error = null;
        this.loading = true;
        await this.$store.dispatch("fetchDeviceLastData", this.deviceId);
        this.deviceData = this.getDeviceLastData(this.deviceId);
      } catch (err) {
        this.error = "Failed to fetch device data";
        console.error("Real-time data error:", err);
      } finally {
        this.loading = false;
      }
    },
    loadSavedSettings() {
      const savedSettings = localStorage.getItem(
        `device-${this.deviceId}-settings`
      );
      if (savedSettings) {
        this.displaySettings = JSON.parse(savedSettings);
      }
    },
  },
  async mounted() {
    this.loadSavedSettings();
    await this.updateDeviceData();
    this.updateInterval = setInterval(() => {
      this.updateDeviceData();
    }, 30000);
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  },
};
</script>

<style scoped>
.device-header-info-block {
  margin-bottom: 20px;
}
</style>
