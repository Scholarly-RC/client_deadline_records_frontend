export default defineAppConfig({
  ui: {
    button: {
      slots: {
        base: "cursor-pointer",
      },
    },
    formField: {
      slots: {
        error: "mt-1 text-xs",
      },
    },
    checkboxGroup: {
      slots: {
        item: "cursor-pointer",
      },
    },
  },
});
