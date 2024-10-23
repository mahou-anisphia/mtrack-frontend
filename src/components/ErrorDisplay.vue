<!-- // components/ErrorDisplay.vue -->
<template>
  <div
    class="flex align-items-center justify-content-center surface-danger p-3 border-round"
    style="height: 400px"
  >
    <i class="pi pi-exclamation-triangle mr-2"></i>
    {{ error }}
  </div>
</template>

<script>
export default {
  name: "ErrorDisplay",
  props: {
    error: {
      type: String,
      required: true,
    },
  },
};
</script>
