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
      <!-- Right side with notifications and user menu -->
      <div class="flex align-items-center gap-4">
        <div class="relative">
          <Button
            @click="toggleNotifications"
            icon="pi pi-bell"
            severity="secondary"
            text
            rounded
            aria-label="Notifications"
            v-tooltip.bottom="'Notifications'"
            :badge="pendingNotifications.length.toString()"
            :badge-severity="
              pendingNotifications.length ? 'danger' : 'secondary'
            "
          />
          <OverlayPanel
            ref="notificationPanel"
            :showCloseIcon="true"
            class="notification-panel"
          >
            <div
              class="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border"
            >
              <span class="text-xl font-bold">Notifications</span>
              <Button
                v-if="pendingNotifications.length > 0"
                label="Acknowledge All"
                icon="pi pi-check"
                size="small"
                severity="secondary"
                @click="acknowledgeAllNotifications"
              />
            </div>
            <div class="notification-list">
              <template v-if="pendingNotifications.length > 0">
                <div
                  v-for="notification in pendingNotifications"
                  :key="notification.notification_id"
                  class="notification-item p-3 border-bottom-1 surface-border"
                >
                  <div class="flex justify-content-between align-items-start">
                    <div>
                      <Tag
                        :severity="getNotificationSeverity(notification.type)"
                        class="mb-2"
                      >
                        {{ formatNotificationType(notification.type) }}
                      </Tag>
                      <p class="m-0 text-sm">{{ notification.message }}</p>
                      <small class="text-color-secondary">
                        {{ formatDate(notification.created_at) }}
                      </small>
                    </div>
                    <Button
                      icon="pi pi-check"
                      text
                      rounded
                      size="small"
                      @click="
                        acknowledgeNotification(notification.notification_id)
                      "
                      v-tooltip.left="'Acknowledge'"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="p-4 text-center text-color-secondary">
                  <i class="pi pi-check-circle text-xl mb-2"></i>
                  <p class="m-0">No pending notifications</p>
                </div>
              </template>
            </div>
          </OverlayPanel>
        </div>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { jwtDecode } from "jwt-decode";
// Import required PrimeVue components
import Menu from "primevue/menu";
import OverlayPanel from "primevue/overlaypanel";
import Tag from "primevue/tag";

const router = useRouter();
const store = useStore();
const menu = ref();
const userBtn = ref();
const notificationPanel = ref();
const username = ref("");
const userMenuItems = ref([{}]);

// Add interval reference for cleanup
let notificationInterval = null;

const toggleNotifications = (event) => {
  notificationPanel.value.toggle(event);
};

const toggleUserInfo = (event) => {
  menu.value.toggle(event);
};

const handleSignOut = async () => {
  try {
    await store.dispatch("logout");
    localStorage.removeItem("showWelcome");
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Get pending notifications from Vuex store
const pendingNotifications = computed(() => {
  return store.getters.getPendingNotifications;
});

// Format notification type
const formatNotificationType = (type) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Format date helper function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
};

// Get notification severity for tag coloring
const getNotificationSeverity = (type) => {
  const severityMap = {
    alert: "danger",
    warning: "warning",
    info: "info",
    success: "success",
    low_battery: "warning",
  };
  return severityMap[type.toLowerCase()] || "info";
};

// Acknowledge single notification
const acknowledgeNotification = async (notificationId) => {
  try {
    await store.dispatch("acknowledgeNotification", notificationId);
    await fetchPendingNotifications();
    if (pendingNotifications.value.length === 0) {
      notificationPanel.value.hide();
    }
  } catch (error) {
    console.error("Failed to acknowledge notification:", error);
  }
};

// Acknowledge all notifications
const acknowledgeAllNotifications = async () => {
  try {
    const notificationIds = pendingNotifications.value.map(
      (n) => n.notification_id
    );
    await store.dispatch("batchAcknowledgeNotifications", notificationIds);
    await fetchPendingNotifications();
    notificationPanel.value.hide();
  } catch (error) {
    console.error("Failed to acknowledge notifications:", error);
  }
};

// Fetch pending notifications
const fetchPendingNotifications = async () => {
  try {
    await store.dispatch("fetchPendingNotifications");
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      username.value = decoded.username;

      // Initial fetch of notifications
      await fetchPendingNotifications();

      // Set up polling for new notifications every 30 seconds
      notificationInterval = setInterval(fetchPendingNotifications, 30000);
    }
  } catch (error) {
    console.error("Error in mounted hook:", error);
    username.value = "Unknown User";
  }
});

onUnmounted(() => {
  // Clean up notification polling interval
  if (notificationInterval) {
    clearInterval(notificationInterval);
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

.notification-panel {
  min-width: 400px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--surface-hover);
}

:deep(.p-button.p-button-icon-only.p-button-rounded) {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
