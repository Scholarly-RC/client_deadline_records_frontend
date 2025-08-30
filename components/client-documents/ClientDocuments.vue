<script setup lang="ts">
// Components
import PageHeader from "~/components/ui/PageHeader.vue";
import ClientDocumentTable from "~/components/client-documents/ClientDocumentTable.vue";
import UploadDocumentModal from "~/components/client-documents/UploadDocumentModal.vue";
import EditDocumentModal from "~/components/client-documents/EditDocumentModal.vue";

// Stores
const clientStore = useClientStore();
const clientDocumentsStore = useClientDocumentsStore();
const uploadDocumentStore = useUploadDocumentStore();
const editDocumentStore = useEditDocumentStore();

const { clients } = storeToRefs(clientStore);
const { selectedClientId, hasSelectedClient, documents, isLoading } =
  storeToRefs(clientDocumentsStore);
const { showModal: showUploadModal } = storeToRefs(uploadDocumentStore);

// Lifecycle Hooks
onMounted(async () => {
  await clientStore.getAllClients();
});

// Computed
const selectedClientValue = computed({
  get: () => selectedClientId.value?.toString() || undefined,
  set: async (value: string | undefined) => {
    const clientId = value ? parseInt(value) : null;
    await clientDocumentsStore.setSelectedClient(clientId);
  },
});

// Methods
const handleClientChange = async (value: string | undefined) => {
  const clientId = value ? parseInt(value) : null;
  await clientDocumentsStore.setSelectedClient(clientId);
};

const openUploadModal = () => {
  if (!selectedClientId.value) return;
  uploadDocumentStore.openModal();
};
</script>

<template>
  <div class="h-screen flex flex-col flex-1 overflow-hidden">
    <PageHeader page="Client Documents" />

    <!-- Content -->
    <main
      class="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      style="max-height: calc(100vh - 4rem)"
    >
      <div class="space-y-6">
        <!-- Client Selection -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Client
          </h2>

          <USelect
            v-model="selectedClientValue"
            :items="
              clients.map((client) => ({
                label: client.name,
                value: client.id.toString(),
              }))
            "
            value-key="value"
            placeholder="Choose a client..."
            class="w-full max-w-md"
          />
        </div>

        <!-- Documents Section -->
        <div
          v-if="hasSelectedClient"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Documents
            </h2>

            <UButton @click="openUploadModal" icon="i-lucide-upload">
              Upload Document
            </UButton>
          </div>

          <ClientDocumentTable />
        </div>

        <!-- No Client Selected Message -->
        <div
          v-else
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center"
        >
          <div class="max-w-md mx-auto">
            <div class="mb-4">
              <UIcon
                name="i-lucide-file-text"
                class="mx-auto h-12 w-12 text-gray-400"
              />
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Client Selected
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Please select a client from the dropdown above to view their
              documents.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <UploadDocumentModal />
    <EditDocumentModal />
  </div>
</template>
