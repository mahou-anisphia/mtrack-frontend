// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  //   withCredentials: true,
});

// // Add a request interceptor
// api.interceptors.request.use(
//   (config) => {
//     // You might want to add auth token here if needed
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
