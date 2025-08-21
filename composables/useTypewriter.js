export const useTypewriter = (text, elementRef) => {
  let i = 0;
  let isDeleting = false;
  let timeoutId = null;
  let randomStop = 0; // Move this outside and initialize

  const type = () => {
    if (!elementRef.value) return;

    if (!isDeleting && i < text.length) {
      elementRef.value.innerHTML =
        text.substring(0, i + 1) + '<span class="animate-pulse">|</span>';
      i++;
      timeoutId = setTimeout(type, 120);
    } else if (!isDeleting && i === text.length) {
      timeoutId = setTimeout(() => {
        isDeleting = true;
        // Calculate randomStop only once when starting to delete
        const minKeep = Math.floor(text.length * 0.3);
        randomStop =
          Math.floor(Math.random() * (text.length - minKeep)) + minKeep;
        type();
      }, 5000);
    } else if (isDeleting && i > 0) {
      if (i > randomStop) {
        elementRef.value.innerHTML =
          text.substring(0, i - 1) + '<span class="animate-pulse">|</span>';
        i--;
        timeoutId = setTimeout(type, 100);
      } else {
        isDeleting = false;
        timeoutId = setTimeout(type, 0);
      }
    }
  };

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { startTyping: type, stopTyping: stop };
};
