<script setup>
const route = useRoute();

const activeLinkClasses =
  "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100";
const inactiveLinkClasses =
  "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700";
const activeIconClasses = "text-primary-600 dark:text-primary-300";
const inactiveIconClasses =
  "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300";

const getLinkClasses = (path) => {
  return route.path === path ? activeLinkClasses : inactiveLinkClasses;
};

const getIconClasses = (path) => {
  return route.path === path ? activeIconClasses : inactiveIconClasses;
};
</script>

<template>
  <!-- Mobile sidebar -->
  <div class="h-screen md:hidden fixed inset-0 z-40 flex">
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-75"
      id="mobile-sidebar-backdrop"
    ></div>
    <div
      class="relative flex flex-col flex-1 w-full max-w-xs bg-white dark:bg-gray-800"
      id="mobile-sidebar"
    >
      <div class="absolute top-0 right-0 pt-2 -mr-12">
        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          id="mobile-sidebar-close"
        >
          <span class="sr-only">Close sidebar</span>
          <svg
            class="w-6 h-6 text-white"
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Users
          </NuxtLink>
        </nav>
      </div>
      <div
        class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          id="dark-mode-toggle"
          class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            ></path>
          </svg>
          Dark Mode
        </button>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
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
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Users
          </NuxtLink>
        </nav>
      </div>
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          id="desktop-dark-mode-toggle"
          class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            ></path>
          </svg>
          Dark Mode
        </button>
      </div>
    </div>
  </div>
</template>
