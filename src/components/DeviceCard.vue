<!-- src/components/DeviceCard.vue -->
<template>
  <Card class="h-full device-card">
    <template #header>
      <div class="flex justify-content-between align-items-center px-4 py-3">
        <div class="text-xl font-bold">Device {{ device.device_id }}</div>
        <Menu ref="menu" :model="menuItems" :popup="true" />
        <Button
          icon="pi pi-ellipsis-v"
          @click="toggleMenu"
          text
          rounded
          aria-label="Menu"
        />
      </div>
    </template>
    <template #content>
      <div class="flex flex-column gap-3 px-4 py-4">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-calendar text-lg text-primary"></i>
          <div class="flex flex-column">
            <span class="text-lg font-semibold mb-1">Created:</span>
            <span class="text-color-secondary">{{
              formatDate(device.created_at)
            }}</span>
          </div>
        </div>
        <div class="flex align-items-center gap-3">
          <i class="pi pi-clock text-lg text-primary"></i>
          <div class="flex flex-column">
            <span class="text-lg font-semibold mb-1">Last Update:</span>
            <span class="text-color-secondary">{{
              formatDate(device.updated_at)
            }}</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script>
export default {
  name: "DeviceCard",
  props: {
    device: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      menuItems: [
        {
          label: "Edit Device",
          icon: "pi pi-pencil",
          command: () => this.editDevice(),
        },
        {
          label: "Delete Device",
          icon: "pi pi-trash",
          class: "text-red-600",
          command: () => this.deleteDevice(),
        },
      ],
    };
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    },
    toggleMenu(event) {
      this.$refs.menu.toggle(event);
    },
    editDevice() {
      console.log("Edit device:", this.device.device_id);
    },
    deleteDevice() {
      console.log("Delete device:", this.device.device_id);
    },
  },
};
</script>

<style scoped>
.device-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.device-card :deep(.p-card-body) {
  padding: 0; /* Remove default padding to have better control */
}

.device-card :deep(.p-card-content) {
  padding: 0; /* Remove default padding to have better control */
}

/* Optional: Add a subtle hover effect */
.device-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease-in-out;
}
</style>
