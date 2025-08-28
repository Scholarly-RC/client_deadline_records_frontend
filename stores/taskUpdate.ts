import type { TaskList } from '~/types';

interface TaskUpdateState {
  showModal: boolean;
  category: string | null;
  task: TaskList | null;
}

export const useTaskUpdate = defineStore("taskUpdate", {
  state: (): TaskUpdateState => ({
    showModal: false,
    category: null,
    task: null,
  }),
  actions: {
    open(category: string, task: TaskList): void {
      this.category = category;
      this.task = task;
      this.showModal = true;
    },
    close(): void {
      this.category = null;
      this.task = null;
      this.showModal = false;
    },
  },
});
