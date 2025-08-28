<script setup>
// Components
import DarkModeToggle from "./DarkModeToggle.vue";
import LogoutButton from "./LogoutButton.vue";

const appTitle = ref(null);
const { startTyping, stopTyping } = useTypewriter(
  "Client Task Tracker",
  appTitle
);

// Route
const route = useRoute();

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const sidebarStore = useSidebarStore();
const { showSidebar } = storeToRefs(sidebarStore);

// Navigation items with proper UNavigationMenu structure
const allItems = [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      to: "/",
    },
    {
      label: "Clients",
      icon: "i-lucide-users",
      to: "/clients",
      adminOnly: true,
    },
    {
      label: "Tasks",
      icon: "i-lucide-calendar",
      to: "/tasks",
      adminOnly: true,
    },
    {
      label: "My Tasks",
      icon: "i-lucide-user-check",
      to: "/my-tasks",
    },
    {
      label: "Pending Approvals",
      icon: "i-lucide-check-circle",
      to: "/approvals",
      adminOnly: true,
    },
    {
      label: "Users",
      icon: "i-lucide-user-cog",
      to: "/users",
      adminOnly: true,
    },
    {
      label: "Logs",
      icon: "i-lucide-list",
      to: "/logs",
      adminOnly: true,
    },
  ],
];

// Filter items based on user role and add active state
const items = computed(() => {
  const filteredItems = isAdmin.value
    ? allItems
    : [
        allItems[0].filter(
          (item) =>
            ["Dashboard", "My Tasks"].includes(item.label) && !item.adminOnly
        ),
      ];

  // Add active state to items
  return filteredItems.map((group) =>
    group.map((item) => ({
      ...item,
      active: route.path === item.to || route.path.startsWith(`${item.to}/`),
    }))
  );
});

// Method to close mobile sidebar when navigating
const handleMobileNavigation = () => {
  if (showSidebar.value) {
    sidebarStore.close();
  }
};

onMounted(() => {
  startTyping();
});

onUnmounted(() => {
  stopTyping();
});
</script>

<template>
  <!-- Mobile sidebar using UModal -->
  <UModal
    v-model:open="showSidebar"
    title="Client Task Tracker"
    description="Navigate to different sections of the application"
    :ui="{
      width: 'max-w-xs w-80',
      height: 'h-full',
      rounded: '',
      shadow: 'shadow-xl',
      container: 'items-start justify-start',
    }"
    :overlay="true"
    :transition="true"
    class="md:hidden"
  >
    <template #body>
      <!-- Mobile navigation -->
      <div class="flex-1 overflow-y-auto">
        <UNavigationMenu
          orientation="vertical"
          :items="items"
          @select="handleMobileNavigation"
          class="w-full"
          :ui="{
            link: 'py-3 px-4 text-base font-medium rounded-lg transition-colors duration-200',
            linkActive:
              'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100',
            linkInactive:
              'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            linkLeadingIcon: 'size-6 mr-3 flex-shrink-0',
            linkLeadingIconActive: 'text-primary-600 dark:text-primary-300',
            linkLeadingIconInactive:
              'text-gray-400 group-hover:text-gray-500 dark:text-gray-400',
          }"
        />
      </div>
    </template>
    
    <template #footer>
      <!-- Mobile footer -->
      <div class="flex flex-col items-center justify-center space-y-3 w-full">
        <DarkModeToggle />
        <LogoutButton />
      </div>
    </template>
  </UModal>

  <!-- Desktop sidebar -->
  <div class="h-screen hidden md:flex md:flex-shrink-0">
    <div
      class="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <!-- Desktop header -->
      <div
        class="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h1
          ref="appTitle"
          class="text-xl font-bold text-gray-800 dark:text-white"
        ></h1>
      </div>

      <!-- Desktop navigation -->
      <div class="flex-1 overflow-y-auto p-2">
        <UNavigationMenu
          orientation="vertical"
          :items="items"
          class="w-full"
          :ui="{
            link: 'py-3 px-4 text-base font-medium rounded-lg transition-colors duration-200',
            linkActive:
              'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100',
            linkInactive:
              'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            linkLeadingIcon: 'size-6 mr-3 flex-shrink-0',
            linkLeadingIconActive: 'text-primary-600 dark:text-primary-300',
            linkLeadingIconInactive:
              'text-gray-400 group-hover:text-gray-500 dark:text-gray-400',
          }"
        />
      </div>

      <!-- Desktop footer -->
      <div class="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
        <DarkModeToggle />
        <LogoutButton />
      </div>
    </div>
  </div>
</template>
