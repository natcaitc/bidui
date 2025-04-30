import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    snackbar: false,
    title: '',
    message: '',
    color: 'success',
    timeout: 3000,
  }),
  actions: {
    showMessage ({ message, color = 'success', timeout = 3000, title = null }) {
      this.title = title;
      this.message = message;
      this.color = color;
      this.timeout = timeout;
      this.snackbar = true;
    },
    hideMessage () {
      this.snackbar = false;
    },
  },
});
