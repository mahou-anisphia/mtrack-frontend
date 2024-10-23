// components/BatteryChart.vue
<template>
  <div class="battery-chart">
    <svg width="200" height="100" viewBox="0 0 200 100">
      <!-- Background grid -->
      <g class="grid" stroke="#eee" stroke-width="0.5">
        <template v-for="i in 10" :key="i">
          <line :x1="0" :y1="i * 10" :x2="200" :y2="i * 10" />
        </template>
        <template v-for="i in 20" :key="i">
          <line :x1="i * 10" :y1="0" :x2="i * 10" :y2="100" />
        </template>
      </g>

      <!-- Battery curve -->
      <path :d="batteryPath" fill="none" stroke="#8884d8" stroke-width="2" />

      <!-- Current voltage indicator -->
      <line
        :x1="0"
        :y1="voltageToY(voltage)"
        :x2="200"
        :y2="voltageToY(voltage)"
        stroke="red"
        stroke-width="1"
        stroke-dasharray="4,4"
      />

      <!-- Voltage scale -->
      <text x="5" y="15" class="chart-text">4.2V</text>
      <text x="5" y="95" class="chart-text">3.3V</text>
    </svg>
  </div>
</template>

<script>
export default {
  name: "BatteryChart",
  props: {
    voltage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    batteryPath() {
      // Generate the SVG path for the battery discharge curve
      const points = [];
      for (let i = 0; i <= 20; i++) {
        const x = i * 10;
        // Non-linear curve approximating battery discharge
        const voltage = 4.2 - Math.pow(i / 20, 1.5) * 0.9;
        const y = this.voltageToY(voltage);
        points.push(`${x},${y}`);
      }
      return `M ${points.join(" L ")}`;
    },
  },
  methods: {
    voltageToY(voltage) {
      // Convert voltage to Y coordinate (4.2V = 0, 3.3V = 100)
      return 100 - ((voltage - 3.3) / (4.2 - 3.3)) * 100;
    },
  },
};
</script>

<style scoped>
.battery-chart {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
}

.chart-text {
  font-size: 10px;
  fill: #666;
}
</style>
