<script setup>
// Components
import StatusPill from "../ui/StatusPill.vue";

// Props
const props = defineProps({
  client: Object,
});

// Stores
const editClientStore = useEditClientStore();

// Methods
const handleOpenEditModal = async (id) => {
  await editClientStore.getClient(id);
  editClientStore.open();
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
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button
        @click="handleOpenEditModal(client.id)"
        class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        View
      </button>
    </td>
  </tr>
</template>
