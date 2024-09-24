import { configure } from "vee-validate";

export default defineNuxtPlugin((_nuxtApp) => {
  // Only validate on form submit
  configure({
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: false,
    validateOnModelUpdate: false,
  });
});
