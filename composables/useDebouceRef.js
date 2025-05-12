export function useDebouncedRef(initialValue, delay = 500) {
  const source = ref(initialValue);
  const debounced = ref(initialValue);

  let timeout;

  watch(source, (newVal) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debounced.value = newVal;
    }, delay);
  });

  return {
    source,
    debounced,
  };
}
