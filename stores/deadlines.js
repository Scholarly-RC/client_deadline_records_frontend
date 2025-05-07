export const useDeadlineTypesStore = defineStore("deadlineTypesStore", {
  state: () => ({
    deadlineTypes: [],
    isLoading: false,
  }),

  actions: {
    async getAllDeadlineTypes() {
      try {
        this.isLoading = true;
        const { $apiFetch } = useNuxtApp();
        const response = await $apiFetch("/api/deadline-types/", {
          method: "GET",
        });
        this.deadlineTypes = response;
      } catch (error) {
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
