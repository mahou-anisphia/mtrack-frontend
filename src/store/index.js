import { createStore } from "vuex";
import api from "../api/axios";

export default createStore({
  state: {
    user: null,
    token: null,
    error: null,
    loading: false,
    devices: [], // Add devices to state
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
      // New mutation for devices
      state.devices = devices;
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
      // New action for fetching devices
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
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
    getToken: (state) => state.token,
    getDevices: (state) => state.devices, // New getter for devices
  },
});
