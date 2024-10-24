<template>
  <div
    class="flex align-items-center justify-content-center min-h-screen bg-gray-100"
  >
    <Toast />
    <div class="surface-card p-4 shadow-2 border-round w-full max-w-30rem">
      <div class="text-center mb-5">
        <!-- Added and styled logo -->
        <div class="mb-4 flex justify-content-center">
          <img
            src="../assets/ViettelInnovationLab.jpg"
            alt="Viettel Innovation Lab"
            class="logo-image"
          />
        </div>
        <div class="text-900 text-3xl font-medium mb-3">
          Mtrack Asset Tracker Platform
        </div>
        <span class="text-600 font-medium">Sign in to continue</span>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="username" class="block text-900 font-medium mb-2"
            >Username</label
          >
          <InputText
            id="username"
            v-model="formData.username"
            type="text"
            class="w-full p-inputtext"
            :class="{ 'p-invalid': error }"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-900 font-medium mb-2"
            >Password</label
          >
          <div class="relative">
            <Password
              id="password"
              v-model="formData.password"
              class="w-full"
              :feedback="false"
              :toggleMask="true"
              :class="{ 'p-invalid': error }"
              :inputClass="'w-full'"
              required
            >
              <template #header>
                <div class="absolute right-0 top-0 z-1">
                  <!-- Eye icon will be positioned here by PrimeVue -->
                </div>
              </template>
            </Password>
          </div>
        </div>
        <Button
          type="submit"
          :label="isLoading ? 'Signing in...' : 'Sign In'"
          :loading="isLoading"
          class="w-full"
          :disabled="isLoading"
        />
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

export default {
  name: "Login",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const formData = ref({
      username: "",
      password: "",
    });

    const error = computed(() => store.getters.getError);
    const isLoading = computed(() => store.getters.isLoading);

    const handleSubmit = async () => {
      try {
        await store.dispatch("login", formData.value);
        localStorage.setItem("showWelcome", "true");
        router.push({ path: "/" });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Login Failed",
          detail: "Invalid username or password",
          life: 5000,
        });
        console.error("Login failed:", error);
      }
    };

    return {
      formData,
      error,
      isLoading,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.logo-image {
  max-width: 200px;
  height: auto;
  object-fit: contain;
}

:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-password) {
  width: 100%;
  display: block;
}

:deep(.p-inputtext) {
  padding: 0.75rem 1rem;
}

:deep(.p-password-panel) {
  margin-top: 0.25rem;
}

:deep(.p-button.p-button-icon-only) {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
</style>
