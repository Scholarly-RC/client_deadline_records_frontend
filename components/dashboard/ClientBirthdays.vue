<script setup>
const clientBirthdays = useClientBirthdays();
const { isLoading, data } = storeToRefs(clientBirthdays);

onMounted(async () => {
  await clientBirthdays.getClientBirthdays();
});
</script>

<template>
  <!-- Birthdays Section -->
  <div
    class="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
  >
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
        This Month's Birthdays
      </h3>
    </div>
    <div class="p-6 space-y-4">
      <template v-if="isLoading">
        <div
          v-for="i in 3"
          :key="`skeleton-${i}`"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 animate-pulse"
        >
          <div class="space-y-2 w-full">
            <div class="h-5 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          </div>
        </div>
      </template>

      <!-- Actual Content -->
      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <!-- Today's Birthdays -->
          <div v-if="data?.today.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Today
            </h4>
            <div
              v-for="client in data?.today"
              :key="`today-${client.id}`"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30 cursor-pointer transition-all duration-200 ease-in-out hover:bg-blue-100 hover:dark:bg-blue-900/50 hover:shadow-sm hover:border-blue-300 hover:dark:border-blue-700 hover:-translate-y-0.5 group"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-200 group-hover:dark:bg-blue-700"
                >
                  <span
                    class="text-blue-600 dark:text-blue-300 font-medium h-7 w-7 transition-transform duration-200 group-hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <g data-name="85-Cake">
                        <path
                          d="M31.85 28.47A1 1 0 0 0 31 28h-2.18a3 3 0 0 0 .18-1V15a1 1 0 0 0-1-1h-2V9a1 1 0 0 0-1-1h-6.78A3 3 0 0 0 17 3.18V0a2 2 0 0 0-2 2v1.18A3 3 0 0 0 13.78 8H7a1 1 0 0 0-1 1v5H4a1 1 0 0 0-1 1v12a3 3 0 0 0 .18 1H1a1 1 0 0 0-.89 1.45l1 2A1 1 0 0 0 2 32h28a1 1 0 0 0 .89-.55l1-2a1 1 0 0 0-.04-.98zM16 5a1 1 0 1 1-1 1 1 1 0 0 1 1-1zm11 22a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1h15v-2H5v-3.78a4.31 4.31 0 0 1 .76.55 4.36 4.36 0 0 0 6.08 0 2.4 2.4 0 0 1 3.52 0 4.37 4.37 0 0 0 6.08 0 2.4 2.4 0 0 1 3.52 0 4.65 4.65 0 0 0 2 1.12zm0-7.22a4.29 4.29 0 0 1-.76-.55 4.37 4.37 0 0 0-6.08 0 2.4 2.4 0 0 1-3.52 0 4.37 4.37 0 0 0-6.08 0 2.4 2.4 0 0 1-3.51 0 4.64 4.64 0 0 0-2-1.12V16H7a1 1 0 0 0 1-1v-5h16v4H14v2h13z"
                        />
                        <path d="M22 24h2v2h-2zM10 14h2v2h-2z" />
                      </g>
                    </svg>
                  </span>
                </div>
                <div>
                  <h4
                    class="font-medium text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-blue-700 group-hover:dark:text-blue-300"
                  >
                    {{ client.name }}
                  </h4>
                  <p
                    class="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200 group-hover:text-blue-600 group-hover:dark:text-blue-200"
                  >
                    Birthday today!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Birthdays -->
          <div v-if="data?.upcoming.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Upcoming
            </h4>
            <div
              v-for="client in data?.upcoming"
              :key="`upcoming-${client.id}`"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                >
                  <span
                    class="text-gray-600 dark:text-gray-300 font-medium w-7 h-7"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <g data-name="60-Calendar">
                        <path
                          d="M29 0H3a3 3 0 0 0-3 3v26a3 3 0 0 0 3 3h12v-2H3a1 1 0 0 1-1-1V10h28v5h2V3a3 3 0 0 0-3-3zm-7 8H10V6h12zm8 0h-6V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3H2V3a1 1 0 0 1 1-1h26a1 1 0 0 1 1 1z"
                        />
                        <path d="M4 4h2v2H4zM26 4h2v2h-2z" />
                        <rect x="5" y="12" width="4" height="4" rx="1" ry="1" />
                        <path
                          d="M21 13a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1h4zM27 13a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1h4z"
                        />
                        <rect
                          x="11"
                          y="12"
                          width="4"
                          height="4"
                          rx="1"
                          ry="1"
                        />
                        <rect x="5" y="18" width="4" height="4" rx="1" ry="1" />
                        <rect
                          x="11"
                          y="18"
                          width="4"
                          height="4"
                          rx="1"
                          ry="1"
                        />
                        <rect x="5" y="24" width="4" height="4" rx="1" ry="1" />
                        <path
                          d="M11 25v2a1 1 0 0 0 1 1h2v-4h-2a1 1 0 0 0-1 1zM24 16a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"
                        />
                        <path d="M23 20h2v4h-2zM23 26h2v2h-2z" />
                      </g>
                    </svg>
                  </span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ client.name }}
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ client.date_of_birth }} ({{
                      $getDaysRemaining(client.days_remaining)
                    }})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Past Birthdays -->
          <div v-if="data?.past.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Earlier this month
            </h4>
            <div
              v-for="client in data?.past"
              :key="`past-${client.id}`"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700 opacity-75 hover:opacity-100 cursor-pointer"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center opacity-60"
                >
                  <span
                    class="text-gray-600 dark:text-gray-300 font-medium h-7 w-7"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                    >
                      <g data-name="65-Calendar - Time">
                        <path d="M4 4h2v2H4zM26 4h2v2h-2z" />
                        <path
                          d="M29 0H3a3 3 0 0 0-3 3v26a3 3 0 0 0 3 3h23a1 1 0 0 0 .71-.29l5-5A1 1 0 0 0 32 26V3a3 3 0 0 0-3-3zm1 25h-3a2 2 0 0 0-2 2v3H3a1 1 0 0 1-1-1V10h28zM10 8V6h12v2zm20 0h-6V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3H2V3a1 1 0 0 1 1-1h26a1 1 0 0 1 1 1z"
                        />
                        <path
                          d="M16 28a8 8 0 1 0-8-8 8 8 0 0 0 8 8zm0-14a6 6 0 1 1-6 6 6 6 0 0 1 6-6z"
                        />
                        <path
                          d="m17.29 22.71 1.41-1.41-1.7-1.71V17h-2v3a1 1 0 0 0 .29.71z"
                        />
                      </g>
                    </svg>
                  </span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ client.name }}
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ client.date_of_birth }} ({{
                      $getDaysRemaining(client.days_remaining)
                    }})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="
              !isLoading &&
              data?.today.length === 0 &&
              data?.upcoming.length === 0 &&
              data?.past.length === 0
            "
            class="p-4 text-center text-gray-500 dark:text-gray-400"
          >
            No birthdays this month
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
