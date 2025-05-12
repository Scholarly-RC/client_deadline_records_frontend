export const useAddWorkUpdateStore = defineStore("addWorkUpdateStore", {
  state: () => ({
    showModal: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
  },
});

export const useWorkUpdateStore = defineStore("workUpdateStore", {
  state: () => ({
    workUpdates: {},
    pagination: {},
    showModal: false,
    isLoading: false,
  }),

  actions: {
    open() {
      this.showModal = true;
    },
    close() {
      this.showModal = false;
    },
    async getWorkUpdates() {
      const alertStore = useAlertStore();
      try {
        this.isLoading = true;
        const viewDeadlineStore = useViewDeadlineStore();
        const { $apiFetch } = useNuxtApp();
        let url = `/api/work-updates/?`;

        const params = new URLSearchParams();

        if (viewDeadlineStore.deadline) {
          params.append("deadline", viewDeadlineStore.deadline.id);
        }
        url += params.toString();

        const response = await $apiFetch(url, {
          method: "GET",
        });

        const { results, ...pagination } = response;

        this.workUpdates = results;
        this.pagination = pagination;
      } catch (error) {
        alertStore.warning("Not Found!", error.detail, 5);
        await navigateTo("/deadlines");
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
