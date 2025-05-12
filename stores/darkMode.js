import { defineStore } from "pinia";

export const useDarkModeStore = defineStore("darkModeStore", {
  state: () => ({
    darkMode: false,
  }),
  actions: {
    toggle() {
      const colorMode = useColorMode();
      colorMode.preference =
        colorMode.preference === "light" ? "dark" : "light";

      this.darkMode = colorMode.preference === "dark";
    },
  },
});
