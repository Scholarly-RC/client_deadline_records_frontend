import { defineStore } from "pinia";

export const useAlertStore = defineStore("alertStore", {
  state: () => ({
    alerts: [],
  }),
  getters: {
    activeAlerts() {
      return this.alerts;
    },
    hasAlerts() {
      return this.alerts.length > 0;
    },
  },
  actions: {
    addAlert(title, description, type, duration = null) {
      const alert = {
        id: Date.now(),
        title,
        description,
        type,
        duration,
      };
      this.alerts.push(alert);

      if (typeof duration === "number" && duration > 0) {
        if (import.meta.client) {
          setTimeout(() => {
            this.removeAlert(alert.id);
          }, duration * 1000);
        }
      }
    },

    info(title, description, duration) {
      this.addAlert(title, description, "INFO", duration);
    },
    success(title, description, duration) {
      this.addAlert(title, description, "SUCCESS", duration);
    },
    warning(title, description, duration) {
      this.addAlert(title, description, "WARNING", duration);
    },
    danger(title, description, duration) {
      this.addAlert(title, description, "DANGER", duration);
    },

    removeAlert(id) {
      this.alerts = this.alerts.filter((alert) => alert.id !== id);
    },
    removeAllAlert() {
      this.alerts = [];
    },
  },
});
