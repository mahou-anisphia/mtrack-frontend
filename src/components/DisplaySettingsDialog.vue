<template>
  <Dialog
    :visible="modelValue"
    header="Display Settings"
    :modal="true"
    :style="{ width: '50vw' }"
    :closable="true"
    @hide="closeDialog"
    @update:visible="(value) => $emit('update:modelValue', value)"
    class="p-4"
  >
    <div class="flex flex-column gap-4 pt-2 pb-3">
      <!-- Display Mode Selection -->
      <div class="flex align-items-center">
        <label class="w-12rem">Time Mode:</label>
        <SelectButton
          v-model="settings.displayMode"
          :options="displayModes"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <!-- Time Frame Dropdown -->
      <div class="flex align-items-center">
        <label class="w-12rem">Time Frame:</label>
        <Dropdown
          v-model="settings.timeFrame"
          :options="timeFrames"
          optionLabel="label"
          optionValue="value"
          placeholder="Select Time Frame"
          class="w-full max-w-20rem"
          :disabled="settings.displayMode === 'last'"
        />
      </div>
      <!-- Data Points Slider -->
      <div class="flex flex-column gap-2">
        <label>Number of Data Points:</label>
        <div class="flex align-items-center gap-3">
          <Slider
            v-model="settings.dataPoints"
            class="w-full"
            :min="1"
            :max="1000"
            :disabled="settings.displayMode === 'last'"
          />
          <InputNumber
            v-model="settings.dataPoints"
            :min="1"
            :max="1000"
            class="w-16"
            :maxFractionDigits="0"
            :disabled="settings.displayMode === 'last'"
          />
        </div>
      </div>
      <!-- Display Markers Checkbox -->
      <div class="flex align-items-center gap-3">
        <Checkbox
          v-model="settings.displayAllMarkers"
          :binary="true"
          :disabled="settings.displayMode === 'last'"
        />
        <label>Display all markers</label>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2 pt-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeDialog"
          class="p-button-secondary"
        />
        <Button label="Apply" icon="pi pi-check" @click="applySettings" />
      </div>
    </template>
  </Dialog>
</template>

<script>
export default {
  name: "DisplaySettingsDialog",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    initialSettings: {
      type: Object,
      default: () => ({
        displayMode: "last",
        timeFrame: 300,
        dataPoints: 100,
        displayAllMarkers: false,
      }),
    },
  },
  emits: ["update:modelValue", "apply-settings"],
  data() {
    // Initialize settings with the correct displayAllMarkers value based on mode
    const initialData = { ...this.initialSettings };
    if (initialData.displayMode === "last") {
      initialData.displayAllMarkers = true;
    }
    return {
      settings: initialData,
      displayModes: [
        { label: "Last", value: "last" },
        { label: "Relative", value: "relative" },
      ],
      timeFrames: [
        { label: "Last 1 minute", value: 60 },
        { label: "Last 5 minutes", value: 300 },
        { label: "Last 10 minutes", value: 600 },
        { label: "Last 30 minutes", value: 1800 },
        { label: "Last 1 hour", value: 3600 },
        { label: "Last 3 hours", value: 10800 },
        { label: "Last 6 hours", value: 21600 },
        { label: "Last 12 hours", value: 43200 },
        { label: "Last 24 hours", value: 86400 },
      ],
    };
  },
  watch: {
    initialSettings: {
      handler(newSettings) {
        const updatedSettings = { ...newSettings };
        if (updatedSettings.displayMode === "last") {
          updatedSettings.displayAllMarkers = true;
        }
        this.settings = updatedSettings;
      },
      deep: true,
    },
    "settings.displayMode": {
      handler(newMode) {
        if (newMode === "last") {
          this.settings.displayAllMarkers = true;
        }
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:modelValue", false);
    },
    applySettings() {
      this.$emit("apply-settings", { ...this.settings });
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<style scoped>
:deep(.p-dialog-content) {
  padding: 0 1.5rem;
}
:deep(.p-dialog-header),
:deep(.p-dialog-footer) {
  padding: 1.5rem;
}

/* General disabled state */
:deep(.p-disabled),
:deep(.p-component:disabled) {
  cursor: not-allowed !important;
}

/* Dropdown specific */
:deep(.p-dropdown.p-disabled),
:deep(.p-dropdown.p-disabled *) {
  cursor: not-allowed !important;
}

/* Slider specific */
:deep(.p-slider.p-disabled),
:deep(.p-slider.p-disabled .p-slider-handle),
:deep(.p-slider.p-disabled .p-slider-range) {
  cursor: not-allowed !important;
}

/* Input Number specific */
:deep(.p-inputnumber.p-disabled),
:deep(.p-inputnumber.p-disabled input),
:deep(.p-inputnumber.p-disabled button) {
  cursor: not-allowed !important;
}

/* Checkbox specific */
:deep(.p-checkbox.p-disabled),
:deep(.p-checkbox.p-disabled *),
:deep(.p-checkbox.p-disabled + label) {
  cursor: not-allowed !important;
}

/* SelectButton specific */
:deep(.p-selectbutton.p-disabled),
:deep(.p-selectbutton.p-disabled *) {
  cursor: not-allowed !important;
}
</style>
