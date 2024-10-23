<template>
  <svg width="40" height="20" viewBox="0 0 40 20">
    <g>
      <!-- Battery outline -->
      <rect
        x="1"
        y="1"
        width="34"
        height="18"
        rx="2"
        stroke="#666"
        fill="none"
        stroke-width="2"
      />
      <!-- Battery tip -->
      <rect x="35" y="6" width="4" height="8" fill="#666" rx="1" />
      <!-- Battery fill -->
      <rect
        x="3"
        y="3"
        :width="fillWidth"
        height="14"
        :fill="fillColor"
        rx="1"
      />
    </g>
  </svg>
</template>

<script>
export default {
  name: "BatteryIcon",
  props: {
    percentage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    fillWidth() {
      // Calculate width based on percentage (max width is 30)
      return (this.percentage / 100) * 30;
    },
    fillColor() {
      if (this.percentage <= 20) return "#f44336"; // Red
      if (this.percentage <= 40) return "#FFA726"; // Orange
      return "#4CAF50"; // Green
    },
  },
};
</script>
