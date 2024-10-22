import { createStore } from "vuex";
import api from "../api/axios";

export default createStore({
  state: {
    user: null,
    token: null,
    error: null,
    loading: false,
    devices: [],
    deviceLastData: {}, // Add state for storing last data per device
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
      // New mutation for device last data
      state.deviceLastData = {
        ...state.deviceLastData,
        [deviceId]: data,
      };
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
      // New action for fetching device last data
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
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
    getToken: (state) => state.token,
    getDevices: (state) => state.devices,
    getDeviceLastData: (state) => (deviceId) => state.deviceLastData[deviceId], // New getter for device last data
  },
});
