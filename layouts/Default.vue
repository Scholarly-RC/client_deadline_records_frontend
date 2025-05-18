<script setup>
import Alert from "~/components/ui/Alert.vue";
</script>

<template>
  <div class="h-full">
    <VitePwaManifest />
    <div>
      <slot />
    </div>
    <Alert />
  </div>
</template>
