import { defineStore } from "pinia";

export const useUserDeadlinesStore = defineStore("userDeadlinesStore", {
  state: () => ({
    deadlines: {},
    isLoading: false,
  }),
  actions: {
    async fetchUserDeadlines(userId) {
      this.isLoading = true;
      try {
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch(`/api/users/${userId}/deadlines-tasks/`, {
          method: "GET",
        });
        this.deadlines = response;
      } catch (error) {
        console.error("Error fetching user deadlines:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
