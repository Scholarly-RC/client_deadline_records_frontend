export const useSidebarStore = defineStore("sidebarStore", {
  state: () => ({
    showSidebar: false,
  }),

  actions: {
    open() {
      this.showSidebar = true;
    },
    close() {
      this.showSidebar = false;
    },
  },
});
