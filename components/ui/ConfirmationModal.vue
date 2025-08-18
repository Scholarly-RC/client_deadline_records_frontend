<script setup>
// Stores
const confirmationStore = useConfirmationStore();
</script>

<template>
  <UModal
    v-model:open="confirmationStore.show"
    title="Confirmation"
    description="Please confirm to proceed with this action."
  >
    <template #body>
      <div class="text-center text-lg font-semibold">
        {{ confirmationStore.message }}
      </div>
    </template>
    <template #footer>
      <div class="w-full flex justify-center space-x-3">
        <UButton
          @click="confirmationStore.resolve(true)"
          label="Confirm"
          icon="mdi:check-bold"
          size="lg"
          variant="solid"
          color="primary"
        />
        <UButton
          @click="confirmationStore.resolve(false)"
          label="Cancel"
          icon="mdi:close-thick"
          size="lg"
          variant="outline"
          color="neutral"
        />
      </div>
    </template>
  </UModal>
</template>
