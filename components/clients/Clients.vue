<script setup>
// Components
import PageHeader from "../ui/PageHeader.vue";
import AddClient from "./AddClient.vue";
import Client from "./Client.vue";

// Stores
const clientStore = useClientStore();
const { clients } = storeToRefs(clientStore);

// Lifecycle Hooks
onMounted(() => {
  clientStore.getAllClients();
});
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Clients" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div></div>
          <AddClient />
        </div>

        <!-- Recent Clients Section -->
        <div
          class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              All Clients
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Added By
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Added
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
              >
                <!-- Client 1 -->
                <Client
                  v-for="client in clients"
                  :key="client.id"
                  :client="client"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
