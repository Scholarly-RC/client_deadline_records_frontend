import { defineStore } from "pinia";

export const useConfirmationStore = defineStore("confirmationStore", () => {
  const show = ref(false);
  const message = ref("");
  let resolver = null;

  const confirm = (msg) => {
    message.value = msg;
    show.value = true;

    return new Promise((resolve) => {
      resolver = resolve;
    });
  };

  const resolve = (confirmed) => {
    show.value = false;
    if (resolver) {
      resolver(confirmed);
      resolver = null;
    }
  };

  return {
    show,
    message,
    confirm,
    resolve,
  };
});
