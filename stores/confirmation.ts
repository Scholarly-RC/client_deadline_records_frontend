import { defineStore } from 'pinia';

type ConfirmationResolver = (confirmed: boolean) => void;

export const useConfirmationStore = defineStore('confirmationStore', () => {
  const show = ref(false);
  const message = ref('');
  let resolver: ConfirmationResolver | null = null;

  const confirm = (msg: string): Promise<boolean> => {
    message.value = msg;
    show.value = true;

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  };

  const resolve = (confirmed: boolean): void => {
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