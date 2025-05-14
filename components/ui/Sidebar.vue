<script setup>
// Components
import DarkModeToggle from "./DarkModeToggle.vue";
import LogoutButton from "./LogoutButton.vue";

// Route
const route = useRoute();

// Stores
const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const sidebarStore = useSidebarStore();
const { showSidebar } = storeToRefs(sidebarStore);

// Link and Icon Classes
const activeLinkClasses =
  "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100";
const inactiveLinkClasses =
  "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";
const activeIconClasses = "text-primary-600 dark:text-primary-300";
const inactiveIconClasses =
  "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300";

// Methods
const getLinkClasses = (path) => {
  return route.path === path || route.path.startsWith(`${path}/`)
    ? activeLinkClasses
    : inactiveLinkClasses;
};

const getIconClasses = (path) => {
  return route.path === path || route.path.startsWith(`${path}/`)
    ? activeIconClasses
    : inactiveIconClasses;
};
</script>

<template>
  <!-- Mobile sidebar -->
  <div
    :class="[
      'h-screen md:hidden fixed z-40 w-80 flex left-0 bg-transparent transition-transform duration-300 ease-in-out',
      showSidebar ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div
      class="relative flex flex-col flex-1 w-full max-w-xs bg-white dark:bg-gray-800"
      id="mobile-sidebar"
    >
      <div class="absolute top-0 right-0 pt-2 -mr-12">
        <button
          v-if="showSidebar"
          @click="sidebarStore.close()"
          type="button"
          class="flex items-center justify-center w-10 h-10 ml-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white shadow-lg"
          id="mobile-sidebar-close"
        >
          <span class="sr-only">Close sidebar</span>
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
      <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
        <div class="flex items-center flex-shrink-0 px-4">
          <h1 class="text-xl font-bold text-gray-800 dark:text-white">
            Client Tracker
          </h1>
        </div>
        <nav class="px-2 mt-5 space-y-1">
          <NuxtLink
            to="/"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 3.75h7.5v7.5h-7.5v-7.5zM12.75 3.75h7.5v7.5h-7.5v-7.5zM3.75 12.75h7.5v7.5h-7.5v-7.5zM12.75 12.75h7.5v7.5h-7.5v-7.5z"
              />
            </svg>
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/clients"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/clients')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/clients')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm5 7a2 2 0 100-4 2 2 0 000 4zm3 5H9a3 3 0 016 0z"
              />
            </svg>
            Clients
          </NuxtLink>
          <NuxtLink
            to="/deadlines"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/deadlines')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/deadlines')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 6V4m8 2V4m-9 4h10M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2zm7 5v2l1.5 1.5"
              />
            </svg>
            Deadlines
          </NuxtLink>
          <NuxtLink
            to="/users"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/users')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/users')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a8.25 8.25 0 0115 0v.75H4.5v-.75z"
              />
            </svg>
            Users
          </NuxtLink>
        </nav>
      </div>
      <div class="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
        <DarkModeToggle />
        <LogoutButton />
      </div>
    </div>
  </div>

  <!-- Static sidebar for desktop -->
  <div class="h-screen hidden md:flex md:flex-shrink-0">
    <div
      class="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div
        class="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h1 class="text-xl font-bold text-gray-800 dark:text-white">
          Client Tracker
        </h1>
      </div>
      <div class="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
        <nav class="flex-1 space-y-2">
          <NuxtLink
            to="/"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 3.75h7.5v7.5h-7.5v-7.5zM12.75 3.75h7.5v7.5h-7.5v-7.5zM3.75 12.75h7.5v7.5h-7.5v-7.5zM12.75 12.75h7.5v7.5h-7.5v-7.5z"
              />
            </svg>
            Dashboard
          </NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            to="/clients"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/clients')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/clients')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm5 7a2 2 0 100-4 2 2 0 000 4zm3 5H9a3 3 0 016 0z"
              />
            </svg>
            Clients
          </NuxtLink>
          <NuxtLink
            to="/deadlines"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/deadlines')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/deadlines')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 6V4m8 2V4m-9 4h10M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2zm7 5v2l1.5 1.5"
              />
            </svg>
            Deadlines
          </NuxtLink>
          <NuxtLink
            v-if="isAdmin"
            to="/users"
            class="flex items-center px-2 py-2 text-base font-medium rounded-md group"
            :class="getLinkClasses('/users')"
          >
            <svg
              class="w-6 h-6 mr-4"
              :class="getIconClasses('/users')"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a8.25 8.25 0 0115 0v.75H4.5v-.75z"
              />
            </svg>
            Users
          </NuxtLink>
        </nav>
      </div>
      <div class="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
        <DarkModeToggle />
        <LogoutButton />
      </div>
    </div>
  </div>
</template>
