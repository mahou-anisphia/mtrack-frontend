import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Message from "primevue/message";
import Card from "primevue/card";
import Menu from "primevue/menu";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import Popover from "primevue/popover";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import FloatLabel from "primevue/floatlabel";
import Tag from "primevue/tag";

export function registerComponents(app) {
  app.component("Button", Button);
  app.component("InputText", InputText);
  app.component("Password", Password);
  app.component("Message", Message);
  app.component("Card", Card);
  app.component("Menu", Menu);
  app.component("ProgressSpinner", ProgressSpinner);
  app.component("Image", Image);
  app.component("Popover", Popover);
  app.directive("tooltip", Tooltip);
  app.use(ToastService);
  app.component("Toast", Toast);
  app.component("FloatLabel", FloatLabel);
  app.component("Tag", Tag);
}
