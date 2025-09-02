import { getDaysRemaining } from "@/utils/getDaysRemaining";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("getDaysRemaining", getDaysRemaining);
});