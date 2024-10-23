<template>
  <div class="col-12 md:col-4">
    <div class="text-500 mb-2">Battery</div>
    <div class="flex align-items-center gap-4">
      <BatteryIcon
        :percentage="batteryPercentage"
        :voltage="normalizedVoltage"
      />
      <div class="flex flex-column">
        <span class="text-xl font-bold">{{ batteryPercentage }}%</span>
        <span class="text-sm text-500">{{ normalizedVoltage }}V</span>
      </div>
      <BatteryChart
        :voltage="normalizedVoltage"
        :percentage="batteryPercentage"
      />
    </div>
  </div>
</template>

<script>
import BatteryIcon from "./BatteryIcon.vue";
import BatteryChart from "./BatteryChart.vue";

export default {
  name: "DeviceBattery",
  components: {
    BatteryIcon,
    BatteryChart,
  },
  props: {
    voltage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    normalizedVoltage() {
      return (this.voltage / 10).toFixed(1);
    },
    batteryPercentage() {
      return this.calculateBatteryPercentage(this.normalizedVoltage);
    },
  },
  methods: {
    calculateBatteryPercentage(voltage) {
      const voltageMap = [
        { voltage: 4.2, percentage: 100 },
        { voltage: 4.1, percentage: 89 },
        { voltage: 4.0, percentage: 78 },
        { voltage: 3.9, percentage: 67 },
        { voltage: 3.8, percentage: 56 },
        { voltage: 3.7, percentage: 44 },
        { voltage: 3.6, percentage: 33 },
        { voltage: 3.5, percentage: 22 },
        { voltage: 3.4, percentage: 11 },
        { voltage: 3.3, percentage: 0 },
      ];

      // Find the two voltage points to interpolate between
      for (let i = 0; i < voltageMap.length - 1; i++) {
        if (
          voltage <= voltageMap[i].voltage &&
          voltage > voltageMap[i + 1].voltage
        ) {
          const upperPoint = voltageMap[i];
          const lowerPoint = voltageMap[i + 1];

          // Linear interpolation
          const percentage =
            lowerPoint.percentage +
            ((voltage - lowerPoint.voltage) *
              (upperPoint.percentage - lowerPoint.percentage)) /
              (upperPoint.voltage - lowerPoint.voltage);

          return Math.round(percentage);
        }
      }

      // Handle edge cases
      if (voltage >= 4.2) return 100;
      if (voltage <= 3.3) return 0;

      return 0; // Fallback
    },
  },
};
</script>
