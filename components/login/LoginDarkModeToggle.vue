<script setup>
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
});
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UButton
      label="Toggle Mode"
      icon="mdi:theme-light-dark"
      color="neutral"
      variant="link"
      size="lg"
      @click="isDark = !isDark"
      class="max-w-xs"
      :ui="{ base: 'flex justify-center' }"
    />
    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
