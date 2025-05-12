import { convertToTitleCase } from "@/utils/convertToTitleCase";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("convertToTitleCase", convertToTitleCase);
});
