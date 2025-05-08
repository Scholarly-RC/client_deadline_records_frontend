export const useDeadlineTypesStore = defineStore("deadlineTypesStore", {
  state: () => ({
    deadlineTypes: [],
    isLoading: false,
  }),
  getters: {
    getDeadlineTypeDefaultReminderDays: (state) => (id) => {
      const type = state.deadlineTypes.find((type) => type.id === id);
      return type ? type.default_reminder_days : 0;
    },
  },
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
