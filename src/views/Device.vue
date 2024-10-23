// DeviceTracker.vue - Main component
<template>
  <div class="min-h-screen">
    <div class="surface-card p-4">
      <DeviceHeader
        :deviceId="deviceId"
        :isRealTimeView="isRealTimeView"
        @switch-to-real-time="switchToRealTime"
        @switch-to-historical="switchToHistorical"
      />

      <DeviceInfo v-if="deviceData" :deviceData="deviceData" />

      <LoadingSpinner v-if="loading" />

      <ErrorDisplay v-else-if="error" :error="error" />

      <DeviceMap
        v-show="!loading && !error"
        ref="deviceMap"
        :deviceData="deviceData"
        :isRealTimeView="isRealTimeView"
        :deviceId="deviceId"
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

    return {
      loading,
      error,
      deviceData,
      updateInterval,
      isRealTimeView,
    };
  },
  computed: {
    ...mapGetters(["getDeviceLastData", "getError"]),
    deviceId() {
      return this.$route.params.id;
    },
  },
  methods: {
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
  },
  async mounted() {
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
