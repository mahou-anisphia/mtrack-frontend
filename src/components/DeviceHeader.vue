<!-- // components/DeviceHeader.vue -->
<template>
  <div class="mb-4">
    <div class="flex justify-content-between align-items-center">
      <h1 class="text-3xl font-bold">Device: {{ deviceId }}</h1>

      <div class="p-buttonset">
        <Button
          :class="{ 'p-button-secondary': !isRealTimeView }"
          @click="$emit('switch-to-real-time')"
          icon="pi pi-clock"
          label="Real-time"
        />
        <Button
          :class="{ 'p-button-secondary': isRealTimeView }"
          @click="$emit('switch-to-historical')"
          icon="pi pi-history"
          label="Historical"
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
