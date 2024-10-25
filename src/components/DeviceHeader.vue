<!-- components/DeviceHeader.vue -->
<template>
  <div class="mb-4">
    <div class="flex justify-content-between align-items-center">
      <div class="flex items-center gap-4">
        <Button
          class="p-button-secondary"
          @click="$router.push('/')"
          icon="pi pi-arrow-left"
          label="Back"
        />
        <h1 class="text-3xl font-bold">Device: {{ deviceId }}</h1>
      </div>
      <Button
        class="p-button-secondary"
        @click="showDisplaySettings"
        icon="pi pi-cog"
        label="Display Settings"
        v-tooltip.bottom="'Configure display settings'"
      />
    </div>

    <!-- Display Settings Dialog -->
    <DisplaySettingsDialog
      v-model="showSettingsDialog"
      :initial-settings="currentSettings"
      @apply-settings="handleDisplaySettings"
    />
  </div>
</template>

<script>
import DisplaySettingsDialog from "./DisplaySettingsDialog.vue";

export default {
  name: "DeviceHeader",
  components: {
    DisplaySettingsDialog,
  },
  props: {
    deviceId: {
      type: String,
      required: true,
    },
    currentSettings: {
      type: Object,
      default: () => ({
        displayMode: "last",
        timeFrame: 300,
        dataPoints: 100,
        displayAllMarkers: false,
      }),
    },
  },
  data() {
    return {
      showSettingsDialog: false,
    };
  },
  methods: {
    showDisplaySettings() {
      this.showSettingsDialog = true;
    },
    handleDisplaySettings(settings) {
      this.$emit("settings-changed", settings);
    },
  },
};
</script>
