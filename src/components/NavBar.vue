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
          v-tooltip.bottom="'Notifications'"
        />
        <div class="relative">
          <Button
            icon="pi pi-user"
            severity="secondary"
            text
            rounded
            aria-label="User profile"
            v-tooltip.bottom="'User Profile'"
            @click="toggleUserInfo"
            ref="userBtn"
          />
          <Menu ref="menu" :model="userMenuItems" :popup="true">
            <template #item="{ item }">
              <div class="p-2">
                <div class="font-semibold">Logged in as:</div>
                <div class="mt-1">{{ username }}</div>
              </div>
            </template>
          </Menu>
        </div>
        <Button
          icon="pi pi-sign-out"
          severity="secondary"
          text
          rounded
          aria-label="Sign out"
          v-tooltip.bottom="'Sign Out'"
          @click="handleSignOut"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import * as jwtDecode from "jwt-decode";
import Menu from "primevue/menu";

const router = useRouter();
const store = useStore();
const menu = ref();
const userBtn = ref();
const username = ref("");

// Menu items (empty array since we're using template slot)
const userMenuItems = ref([{}]);

const toggleUserInfo = (event) => {
  menu.value.toggle(event);
};

const handleSignOut = async () => {
  try {
    await store.dispatch("logout");
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

onMounted(() => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("Token found:", token); // Debug log
      const decoded = jwtDecode.jwtDecode(token);
      console.log("Decoded token:", decoded); // Debug log
      username.value = decoded.username;
    } else {
      console.log("No token found"); // Debug log
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    username.value = "Unknown User";
  }
});
</script>

<style scoped>
.navbar-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

:deep(.p-menu) {
  min-width: 200px;
}

:deep(.p-menu-list) {
  padding: 0;
}
</style>
