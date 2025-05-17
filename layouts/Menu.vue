<script setup>
import NotificationModal from "~/components/notifications/NotificationModal.vue";
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
    <NotificationModal />
    <ConfirmationModal />
  </div>
</template>
