<script setup>
// Components
import RolePill from "../ui/RolePill.vue";
import StatusPill from "../ui/StatusPill.vue";

// Props
const props = defineProps({
  user: Object,
});

// Stores
const editUserStore = useEditUserStore();

// Computed
const initials = computed(() => {
  const firstInitial = props.user.first_name?.charAt(0) || "";
  const lastInitial = props.user.last_name?.charAt(0) || "";
  return (firstInitial + lastInitial).toUpperCase();
});

// Methods
const handleOpenEditModal = async (id) => {
  await editUserStore.editUser(id);
  editUserStore.open();
};
</script>

<template>
  <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div
          class="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
        >
          <span class="text-primary-600 dark:text-primary-300 font-medium">{{
            initials
          }}</span>
        </div>
        <div class="ml-4">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ user.fullname }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ user.username }}
          </div>
        </div>
      </div>
    </td>
    <td
      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
    >
      {{ user.email }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <RolePill :role="user.role" />
    </td>
    <td class="px-6 py-4 whitespace-nowrap">
      <StatusPill :active="user.is_active" />
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button
        @click="handleOpenEditModal(user.id)"
        class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        View
      </button>
    </td>
  </tr>
</template>
