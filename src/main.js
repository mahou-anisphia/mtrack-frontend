// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { setupPrimeVue } from "./plugins/PrimeVue";
import { registerComponents } from "./plugins/PrimeComponents";

const app = createApp(App);

// Use plugins
app.use(router);
app.use(store);
setupPrimeVue(app);

// Register components
registerComponents(app);

app.mount("#app");
