<script setup>
import Alert from "~/components/ui/Alert.vue";
import ConfirmationModal from "~/components/ui/ConfirmationModal.vue";
import Sidebar from "~/components/ui/Sidebar.vue";
</script>

<template>
  <div class="h-full">
    <div class="flex flex-row">
      <Sidebar />
      <slot />
    </div>
    <Alert />
    <ConfirmationModal />
  </div>
</template>
