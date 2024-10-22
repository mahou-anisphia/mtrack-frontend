import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Device from "../views/Device.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/device/:id",
    name: "Device",
    component: Device,
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      // Only allow access if coming from home page or if device exists
      if (from.name === "Home") {
        next();
      } else {
        // Here you could add a check to verify if the device exists
        // For now, redirect to home
        next("/");
      }
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("authToken"); // Or your auth check method
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
