<!-- components/DeviceInfo.vue -->
<template>
  <div class="mb-4">
    <div class="grid grid-cols-6 gap-4 w-full">
      <DeviceBattery :voltage="deviceData.voltage" />
      <div>
        <div class="text-500 mb-2">Last Updated</div>
        <div>
          {{ formatDateTime(deviceData.gps_date, deviceData.gps_time) }}
        </div>
      </div>
      <div>
        <div class="text-500 mb-2">Speed</div>
        <div>{{ deviceData.current_speed }} km/h</div>
      </div>
      <div>
        <div class="text-500 mb-2">Status</div>
        <div class="capitalize">{{ deviceData.status.replace("_", " ") }}</div>
      </div>
      <div>
        <div class="text-500 mb-2">Latitude</div>
        <div>{{ deviceData.latitude.toFixed(6) }}°</div>
      </div>
      <div>
        <div class="text-500 mb-2">Longitude</div>
        <div>{{ deviceData.longitude.toFixed(6) }}°</div>
      </div>
    </div>
  </div>
</template>

<script>
import DeviceBattery from "./DeviceBattery.vue";

export default {
  name: "DeviceInfo",
  components: {
    DeviceBattery,
  },
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
