<script setup>
// Components
import StatusPill from "../ui/StatusPill.vue";

// Props
const props = defineProps({
  client: Object,
});

// Stores
const alertStore = useAlertStore();
const clientStore = useClientStore();
const editClientStore = useEditClientStore();
const confirmationStore = useConfirmationStore();

// Methods
const handleOpenEditModal = async (id) => {
  await editClientStore.getClient(id);
  editClientStore.open();
};

const deleteConfirmation = async () => {
  const confirmed = await confirmationStore.confirm(
    "Are you sure you want to delete this client?"
  );

  if (confirmed) {
    try {
      const { $apiFetch } = useNuxtApp();

      const response = await $apiFetch(`/api/clients/${props.client.id}/`, {
        method: "DELETE",
      });
      await clientStore.getAllClients();
      alertStore.success(
        "Client Deleted",
        "The selected client has been deleted successfully.",
        3.5
      );
    } catch (error) {
      alertStore.danger("Deletion Failed", getErrorMessage(error), 5);
      console.error(error);
    }
  }
};
</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td
      class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ client.name }}
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      <StatusPill :active="client.is_active" />
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ client.contact_person }}
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ client.created_by.fullname }}
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ client.created_at }}
    </td>
    <td
      class="flex flex-row gap-1 px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
    >
      <UButton
        @click="handleOpenEditModal(client.id)"
        label="View"
        leading-icon="mdi:account-arrow-right-outline"
        color="info"
        size="lg"
      />
      <UButton
        @click="deleteConfirmation"
        label="Delete"
        leading-icon="mdi:account-minus"
        color="error"
        size="lg"
      />
    </td>
  </tr>
</template>
