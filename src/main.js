// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// PrimeVue imports
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Message from "primevue/message";
import Card from "primevue/card";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";

// Core CSS
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{red.50}",
      100: "{red.100}",
      200: "{red.200}",
      300: "{red.300}",
      400: "{red.400}",
      500: "{red.500}",
      600: "{red.600}",
      700: "{red.700}",
      800: "{red.800}",
      900: "{red.900}",
      950: "{red.950}",
    },
  },
});
// Use plugins
app.use(router);
app.use(store);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
  },
});

// Register PrimeVue components
app.component("Button", Button);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Message", Message);
app.component("Card", Card);
app.component("Menu", Menu);
app.component("ProgressSpinner", ProgressSpinner);

app.mount("#app");
