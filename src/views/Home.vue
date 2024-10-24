<template>
  <div class="min-h-screen">
    <Toast />
    <div class="surface-card p-4">
      <div class="mb-4 flex justify-content-between align-items-center">
        <h1 class="text-3xl font-bold">Devices Overview</h1>
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          @click="refreshDevices"
          :loading="loading"
        />
      </div>
      <!-- Error message -->
      <Message v-if="error" severity="error" :sticky="true" class="mb-4">
        {{ error }}
      </Message>
      <!-- Devices grid -->
      <div class="grid">
        <div
          v-for="device in devices"
          :key="device.device_id"
          class="col-12 md:col-6 lg:col-4 p-2"
        >
          <DeviceCard :device="device" />
        </div>
        <!-- Empty state -->
        <div v-if="!loading && devices.length === 0" class="col-12">
          <div class="surface-ground text-center py-6 px-4 border-round">
            <i class="pi pi-inbox text-4xl text-600 mb-4"></i>
            <p class="text-700">No devices found.</p>
          </div>
        </div>
      </div>
      <!-- Loading overlay -->
      <ProgressSpinner
        v-if="loading && !devices.length"
        class="flex justify-content-center align-items-center my-4"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { useToast } from "primevue/usetoast";
import DeviceCard from "../components/DeviceCard.vue";

export default {
  name: "Home",
  components: {
    DeviceCard,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      error: (state) => state.error,
    }),
    ...mapGetters(["getDevices"]),
    devices() {
      return this.getDevices;
    },
  },
  methods: {
    async refreshDevices() {
      try {
        await this.$store.dispatch("fetchDevices");
      } catch (error) {
        console.error("Failed to refresh devices:", error);
      }
    },
    showWelcomeMessage() {
      if (localStorage.getItem("showWelcome")) {
        this.toast.add({
          severity: "success",
          summary: "Login Successful",
          detail: "Welcome to Mtrack Asset Tracker Platform",
          life: 3000,
        });
        localStorage.removeItem("showWelcome");
      }
    },
  },
  async created() {
    await this.refreshDevices();
  },
  mounted() {
    this.showWelcomeMessage();
  },
};
</script>
