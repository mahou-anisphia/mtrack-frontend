<!-- src/components/Navbar.vue -->
<template>
  <div class="surface-card w-full border-bottom-1 surface-border">
    <div
      class="flex justify-content-between align-items-center px-4 py-2 max-w-screen"
    >
      <!-- Left side with logo -->
      <div class="flex align-items-center">
        <router-link to="/" class="no-underline">
          <img
            src="../assets/ViettelInnovationLab.jpg"
            alt="Viettel Innovation Lab"
            class="navbar-logo mr-2"
          />
        </router-link>
      </div>

      <!-- Right side with placeholder items -->
      <div class="flex align-items-center gap-4">
        <Button
          icon="pi pi-bell"
          severity="secondary"
          text
          rounded
          aria-label="Notifications"
        />
        <Button
          icon="pi pi-user"
          severity="secondary"
          text
          rounded
          aria-label="User profile"
        />
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          rounded
          aria-label="Sign out"
          @click="handleSignOut"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const handleSignOut = async () => {
  try {
    await store.dispatch("logout");
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<style scoped>
.navbar-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
</style>
