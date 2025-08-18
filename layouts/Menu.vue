<script setup>
import ConfirmationModal from "~/components/ui/ConfirmationModal.vue";
import Sidebar from "~/components/ui/Sidebar.vue";
</script>

<template>
  <div class="h-full">
    <VitePwaManifest />
    <div class="flex flex-row">
      <Sidebar />
      <slot />
    </div>
    <ConfirmationModal />
  </div>
</template>
