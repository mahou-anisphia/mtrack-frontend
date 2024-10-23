<!-- // components/DeviceInfo.vue -->
<template>
  <div class="mb-4">
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
        <div class="capitalize">{{ deviceData.status.replace("_", " ") }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DeviceInfo",
  props: {
    deviceData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDateTime(date, time) {
      const datetime = new Date(`${date}T${time}`);
      return datetime.toLocaleString();
    },
  },
};
</script>
