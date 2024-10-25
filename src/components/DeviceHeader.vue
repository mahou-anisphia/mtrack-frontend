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
      <div class="p-buttonset">
        <Button
          :class="{ 'p-button-secondary': !isRealTimeView }"
          @click="$emit('switch-to-real-time')"
          icon="pi pi-clock"
          label="Real-time"
          v-tooltip.bottom="'Real-time monitoring'"
        />
        <Button
          :class="{ 'p-button-secondary': isRealTimeView }"
          @click="$emit('switch-to-historical')"
          icon="pi pi-history"
          label="Historical"
          v-tooltip.bottom="'Edit historical settings'"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DeviceHeader",
  props: {
    deviceId: {
      type: String,
      required: true,
    },
    isRealTimeView: {
      type: Boolean,
      required: true,
    },
  },
};
</script>
