import { createStore } from "vuex";
import api from "../api/axios";

export default createStore({
  state: {
    user: null,
    token: null,
    error: null,
    loading: false,
    devices: [],
    deviceLastData: {},
    deviceLocations: {},
    notifications: [],
    pendingNotifications: [],
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("authToken", token);
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      localStorage.removeItem("authToken");
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_DEVICES(state, devices) {
      state.devices = devices;
    },
    SET_DEVICE_LAST_DATA(state, { deviceId, data }) {
      state.deviceLastData = {
        ...state.deviceLastData,
        [deviceId]: data,
      };
    },
    SET_DEVICE_LOCATIONS(state, { deviceId, locations }) {
      // New mutation for device locations
      state.deviceLocations = {
        ...state.deviceLocations,
        [deviceId]: locations,
      };
    },
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
    },
    SET_PENDING_NOTIFICATIONS(state, notifications) {
      state.pendingNotifications = notifications;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
    },
    UPDATE_NOTIFICATION(state, updatedNotification) {
      const index = state.notifications.findIndex(
        (n) => n.id === updatedNotification.id
      );
      if (index !== -1) {
        state.notifications.splice(index, 1, updatedNotification);
      }
    },
    REMOVE_NOTIFICATION(state, notificationId) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== notificationId
      );
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const response = await api.post("/login", credentials);
        const { token, user } = response.data;

        commit("SET_USER", user);
        commit("SET_TOKEN", token);

        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Login failed";
        commit("SET_ERROR", errorMessage);
        console.error("Login error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    logout({ commit }) {
      commit("SET_USER", null);
      commit("CLEAR_TOKEN");
    },
    async fetchDevices({ commit }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.get("/devices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        commit("SET_DEVICES", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch devices";
        commit("SET_ERROR", errorMessage);
        console.error("Devices fetch error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchDeviceLastData({ commit }, deviceId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.get(`/devices/${deviceId}/last-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        commit("SET_DEVICE_LAST_DATA", {
          deviceId,
          data: response.data,
        });
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch device last data";
        commit("SET_ERROR", errorMessage);
        console.error("Device last data fetch error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchDeviceLocations({ commit }, deviceId) {
      // New action for fetching device locations
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.get(`/devices/${deviceId}/locations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        commit("SET_DEVICE_LOCATIONS", {
          deviceId,
          locations: response.data,
        });
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch device locations";
        commit("SET_ERROR", errorMessage);
        console.error("Device locations fetch error:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async createNotification(
      { commit },
      { deviceId, type, message, assetDataId }
    ) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.post(
          "/notifications",
          {
            device_id: deviceId,
            type,
            message,
            asset_data_id: assetDataId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        commit("ADD_NOTIFICATION", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to create notification";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchDeviceNotifications({ commit }, deviceId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.get(`/devices/${deviceId}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        commit("SET_NOTIFICATIONS", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch notifications";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async fetchPendingNotifications({ commit }) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.get("/notifications/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });

        commit("SET_PENDING_NOTIFICATIONS", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to fetch pending notifications";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async acknowledgeNotification({ commit }, notificationId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.put(
          `/notifications/${notificationId}/acknowledge`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        commit("UPDATE_NOTIFICATION", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to acknowledge notification";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async batchAcknowledgeNotifications({ commit }, notificationIds) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.put(
          "/notifications/batch/acknowledge",
          {
            notification_ids: notificationIds,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update each acknowledged notification in the state
        response.data.notifications.forEach((notification) => {
          commit("UPDATE_NOTIFICATION", notification);
        });

        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to acknowledge notifications";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateNotificationStatus(
      { commit },
      { notificationId, status, message }
    ) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await api.put(
          `/notifications/${notificationId}`,
          {
            status,
            message,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        commit("UPDATE_NOTIFICATION", response.data);
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to update notification";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteNotification({ commit }, notificationId) {
      try {
        commit("SET_LOADING", true);
        commit("SET_ERROR", null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        await api.delete(`/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        commit("REMOVE_NOTIFICATION", notificationId);
        return true;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to delete notification";
        commit("SET_ERROR", errorMessage);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
    getToken: (state) => state.token,
    getDevices: (state) => state.devices,
    getDeviceLastData: (state) => (deviceId) => state.deviceLastData[deviceId],
    getDeviceLocations: (state) => (deviceId) =>
      state.deviceLocations[deviceId],
    getNotifications: (state) => state.notifications,
    getPendingNotifications: (state) => state.pendingNotifications,
    getNotificationById: (state) => (id) =>
      state.notifications.find((n) => n.id === id),
  },
});
