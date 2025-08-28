<script setup lang="ts">
// Components
import DarkModeToggle from "./DarkModeToggle.vue";
import LogoutButton from "./LogoutButton.vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const appTitle = ref<HTMLElement | null>(null);
const { startTyping, stopTyping } = useTypewriter(
  "Client Task Tracker",
  appTitle
);

// Route
const route: RouteLocationNormalizedLoaded = useRoute();

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const sidebarStore = useSidebarStore();
const { showSidebar } = storeToRefs(sidebarStore);

interface NavigationItem {
  label: string;
  icon: string;
  to: string;
  adminOnly?: boolean;
  active?: boolean;
}

// Navigation items with proper UNavigationMenu structure
const allItems: NavigationItem[][] = [
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
const items = computed<NavigationItem[][]>(() => {
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
const handleMobileNavigation = (): void => {
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
      content: 'max-w-xs w-80 h-full',
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
            linkLeadingIcon: 'size-6 mr-3 flex-shrink-0',
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
            linkLeadingIcon: 'size-6 mr-3 flex-shrink-0',
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