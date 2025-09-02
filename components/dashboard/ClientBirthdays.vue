<script setup lang="ts">
import type { ClientBirthdaysData, ClientBirthdayInfo } from "~/types/entities";

// Store and reactive data
const clientBirthdays = useClientBirthdays();
const { isLoading, data } = storeToRefs(clientBirthdays);

// Auth store for admin check
const authStore = useAuthStore();
const { user: authUser } = storeToRefs(authStore);
const isAdmin = computed(() => authUser.value?.role === "admin");

// Fetch data on mount
onMounted(async (): Promise<void> => {
  await clientBirthdays.getClientBirthdays();
});

// Format birthday date
const formatBirthday = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

// Get days remaining text
const getDaysRemainingText = (days: number): string => {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `in ${days} days`;
  if (days === -1) return "Yesterday";
  if (days < -1) return `${Math.abs(days)} days ago`;
  return "Invalid date";
};

// Calculate age from birth date
const calculateAge = (dateOfBirth: string): number | null => {
  try {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
};

// Get birthday status badge
const getBirthdayBadge = (section: keyof ClientBirthdaysData, days: number) => {
  switch (section) {
    case "today":
      return { text: "🎉 Today!", color: "bg-gradient-to-r from-blue-500 to-purple-600" };
    case "upcoming":
      return { text: days === 1 ? "Tomorrow" : `In ${days} days`, color: "bg-gradient-to-r from-green-500 to-emerald-600" };
    case "past":
      return { text: days === -1 ? "Yesterday" : `${Math.abs(days)} days ago`, color: "bg-gradient-to-r from-gray-500 to-slate-600" };
    default:
      return { text: "", color: "bg-gray-500" };
  }
};

// Get section title
const getSectionTitle = (section: keyof ClientBirthdaysData): string => {
  switch (section) {
    case "today":
      return "Today";
    case "upcoming":
      return "Upcoming";
    case "past":
      return "Past";
    default:
      return section;
  }
};

// Get section color
const getSectionColor = (section: keyof ClientBirthdaysData): string => {
  switch (section) {
    case "today":
      return "blue";
    case "upcoming":
      return "green";
    case "past":
      return "gray";
    default:
      return "gray";
  }
};
</script>

<template>
  <!-- Birthdays Section - Admin Only -->
  <UCard
    v-if="isAdmin"
    class="rounded-xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
  >
    <template #header>
      <div class="flex items-center justify-between p-6 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center shadow-lg">
            <span class="text-white text-lg">🎂</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              Client Birthdays
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Celebrate your clients' special days
            </p>
          </div>
        </div>
      </div>
    </template>

    <div class="px-6 pb-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="animate-pulse">
          <div class="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-24 mb-4"></div>
          <div class="space-y-3">
            <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <div class="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-3/4"></div>
                <div class="h-3 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-1/2"></div>
              </div>
              <div class="w-16 h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full"></div>
            </div>
            <div class="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl">
              <div class="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-2/3"></div>
                <div class="h-3 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded w-1/3"></div>
              </div>
              <div class="w-16 h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Sections -->
        <div
          v-for="(sectionData, sectionKey) in data"
          :key="sectionKey"
          v-show="sectionData && sectionData.length > 0"
          class="space-y-4"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :class="{
                'bg-gradient-to-br from-blue-500 to-purple-600 text-white': sectionKey === 'today',
                'bg-gradient-to-br from-green-500 to-emerald-600 text-white': sectionKey === 'upcoming',
                'bg-gradient-to-br from-gray-500 to-slate-600 text-white': sectionKey === 'past',
              }"
            >
              {{ sectionData.length }}
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {{ getSectionTitle(sectionKey as keyof ClientBirthdaysData) }}
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                {{ sectionData.length === 1 ? 'Birthday' : 'Birthdays' }}
              </span>
            </h4>
          </div>

          <div class="grid gap-3">
            <div
              v-for="client in sectionData"
              :key="`${sectionKey}-${client.name}-${client.date_of_birth}`"
              class="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
              :class="{
                'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800':
                  sectionKey === 'today',
                'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800':
                  sectionKey === 'upcoming',
                'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700 opacity-75':
                  sectionKey === 'past',
              }"
            >
              <div class="flex items-center justify-between p-5">
                <div class="flex items-center space-x-4">
                  <!-- Birthday Icon -->
                  <div class="relative">
                    <div
                      class="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                      :class="{
                        'bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-blue-200 dark:shadow-blue-900':
                          sectionKey === 'today',
                        'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200 dark:shadow-green-900':
                          sectionKey === 'upcoming',
                        'bg-gradient-to-br from-gray-400 to-slate-500 text-white shadow-gray-200 dark:shadow-gray-900':
                          sectionKey === 'past',
                      }"
                    >
                      🎂
                    </div>
                    <!-- Age Badge -->
                    <div
                      v-if="calculateAge(client.date_of_birth)"
                      class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                    >
                      {{ calculateAge(client.date_of_birth) }}
                    </div>
                  </div>

                  <div class="flex-1">
                    <h5 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                      {{ client.name }}
                    </h5>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {{ formatBirthday(client.date_of_birth) }}
                    </p>
                    <!-- Status Badge -->
                    <div class="mt-2">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                        :class="getBirthdayBadge(sectionKey as keyof ClientBirthdaysData, client.days_remaining).color"
                      >
                        {{ getBirthdayBadge(sectionKey as keyof ClientBirthdaysData, client.days_remaining).text }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="
            !data ||
            (!data.today?.length &&
              !data.upcoming?.length &&
              !data.past?.length)
          "
          class="text-center py-12"
        >
          <div class="relative mb-6">
            <div class="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-4xl">🎂</span>
            </div>
            <div class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <span class="text-white text-sm">🤷</span>
            </div>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Birthdays Found
          </h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            There are no client birthdays to display at the moment. Check back later or add client information with birth dates.
          </p>
          <div class="mt-6">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              @click="() => {}"
            >
              <UIcon name="i-heroicons-user-plus" class="w-4 h-4 mr-2" />
              Add Client
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
