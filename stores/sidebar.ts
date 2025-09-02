import { defineStore } from 'pinia';

interface SidebarState {
  showSidebar: boolean;
}

export const useSidebarStore = defineStore('sidebarStore', {
  state: (): SidebarState => ({
    showSidebar: false,
  }),

  getters: {
    isCollapsed: (state): boolean => !state.showSidebar,
  },

  actions: {
    open(): void {
      this.showSidebar = true;
    },
    close(): void {
      this.showSidebar = false;
    },
    toggle(): void {
      this.showSidebar = !this.showSidebar;
    },
  },
});