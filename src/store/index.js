import { createStore } from "vuex";
import api from "../api/axios";

export default createStore({
  state: {
    user: null,
    token: null, // Store the token in the state
    error: null,
    loading: false,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      // Mutation to store the token
      state.token = token;
      localStorage.setItem("authToken", token); // Persist token in localStorage
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      localStorage.removeItem("authToken"); // Remove token from localStorage
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
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
        commit("SET_TOKEN", token); // Save the token in the store and localStorage

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
      commit("CLEAR_TOKEN"); // Clear token on logout
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token, // Use token for authentication check
    getUser: (state) => state.user,
    getError: (state) => state.error,
    isLoading: (state) => state.loading,
    getToken: (state) => state.token, // Getter to retrieve the token if needed
  },
});
