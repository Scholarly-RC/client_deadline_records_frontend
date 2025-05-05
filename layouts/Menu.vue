<script setup>
import Sidebar from "~/components/ui/Sidebar.vue";
</script>

<template>
  <div class="h-full">
    <div class="flex flex-row">
      <Sidebar />
      <slot />
    </div>
  </div>
</template>
