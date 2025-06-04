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
      <button
        @click="handleOpenEditModal(client.id)"
        class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        View
      </button>
      <button
        @click="deleteConfirmation"
        class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Delete
      </button>
    </td>
  </tr>
</template>
