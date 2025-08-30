<template>
  <div class="dashboard-layout-switcher">
    <!-- Desktop Layout Switcher -->
    <div class="hidden md:flex items-center gap-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">View:</span>
      <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          v-for="layout in layouts"
          :key="layout.value"
          @click="switchLayout(layout.value)"
          :class="getLayoutButtonClasses(layout.value)"
          class="layout-button"
          :title="layout.description"
        >
          <UIcon :name="layout.icon" class="w-4 h-4 mr-2" />
          <span class="text-sm font-medium">{{ layout.label }}</span>
        </button>
      </div>
    </div>
    
    <!-- Mobile Layout Switcher -->
    <div class="md:hidden">
      <USelectMenu 
        v-model="selectedLayout" 
        :options="layouts"
        option-attribute="label"
        value-attribute="value"
        @update:model-value="handleMobileLayoutChange"
        class="w-48"
      >
        <template #leading>
          <UIcon :name="currentLayoutIcon" class="w-4 h-4" />
        </template>
      </USelectMenu>
    </div>
    
    <!-- Layout Info Tooltip -->
    <UTooltip v-if="showTooltip" :text="currentLayoutDescription" class="ml-2">
      <UButton 
        icon="mdi:information-outline" 
        variant="ghost" 
        size="sm"
        color="neutral"
      />
    </UTooltip>
    
    <!-- Quick Actions -->
    <div v-if="showQuickActions" class="flex items-center gap-2 ml-4">
      <!-- Refresh Button -->
      <UButton 
        @click="handleRefresh"
        :loading="isRefreshing"
        variant="ghost"
        size="sm"
        icon="mdi:refresh"
        :disabled="isRefreshing"
        title="Refresh Dashboard Data"
      />
      

      
      <!-- Export Dashboard -->
      <UButton
        v-if="showExportOptions"
        @click="handleExport('pdf')"
        variant="ghost"
        size="sm"
        icon="mdi:download"
        title="Export Dashboard as PDF"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
// Import removed - DropdownItem type not needed for this component

interface LayoutOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  requiredRole: string | null;
  color: string;
}

interface Props {
  modelValue?: string;
  availableLayouts?: string[];
  showTooltip?: boolean;
  showQuickActions?: boolean;
  showExportOptions?: boolean;
  isRefreshing?: boolean;

}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'operations',
  availableLayouts: () => ['executive', 'operations', 'analytics', 'personal'],
  showTooltip: true,
  showQuickActions: true,
  showExportOptions: true,
  isRefreshing: false,

})

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'refresh'): void;

  (e: 'export', format: string): void;
}

const emit = defineEmits<Emits>()

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const { isAdmin, user } = storeToRefs(authStore)

const selectedLayout = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const allLayouts: LayoutOption[] = [
  {
    value: 'executive',
    label: 'Executive',
    icon: 'mdi:chart-line',
    description: 'High-level KPIs and business performance metrics',
    requiredRole: 'admin',
    color: 'purple'
  },
  {
    value: 'operations',
    label: 'Operations',
    icon: 'mdi:cog-outline',
    description: 'Task distribution, workload management, and team coordination',
    requiredRole: null,
    color: 'blue'
  },
  {
    value: 'analytics',
    label: 'Analytics',
    icon: 'mdi:chart-bar',
    description: 'Detailed trends, patterns, and productivity insights',
    requiredRole: 'admin',
    color: 'green'
  },
  {
    value: 'personal',
    label: 'Personal',
    icon: 'mdi:account-circle-outline',
    description: 'Individual performance and personal productivity metrics',
    requiredRole: null,
    color: 'orange'
  }
]

const layouts = computed(() => {
  return allLayouts.filter(layout => {
    // Check if layout is in available layouts
    if (!props.availableLayouts.includes(layout.value)) return false
    
    // Check role requirements
    if (layout.requiredRole === 'admin' && !isAdmin.value) return false
    
    return true
  })
})

const currentLayout = computed(() => {
  return layouts.value.find(layout => layout.value === selectedLayout.value) || layouts.value[0]
})

const currentLayoutIcon = computed(() => {
  return currentLayout.value?.icon || 'mdi:view-dashboard'
})

const currentLayoutDescription = computed(() => {
  return currentLayout.value?.description || 'Dashboard view'
})



const getLayoutButtonClasses = (layoutValue: string): string => {
  const isActive = selectedLayout.value === layoutValue
  const baseClasses = 'px-3 py-2 rounded-md transition-all duration-200 flex items-center'
  
  if (isActive) {
    return `${baseClasses} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`
  } else {
    return `${baseClasses} text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700`
  }
}

const switchLayout = (layoutValue: string): void => {
  if (layoutValue !== selectedLayout.value) {
    selectedLayout.value = layoutValue
    dashboardStore.switchLayout(layoutValue)
  }
}

const handleMobileLayoutChange = (layoutValue: any): void => {
  if (layoutValue && typeof layoutValue === 'string') {
    switchLayout(layoutValue)
  } else if (layoutValue && layoutValue.value) {
    switchLayout(layoutValue.value)
  }
}

const handleRefresh = (): void => {
  emit('refresh')
}



const handleExport = (format: string): void => {
  emit('export', format)
}

// Watch for layout changes and update store
watch(selectedLayout, (newLayout) => {
  dashboardStore.switchLayout(newLayout)
}, { immediate: true })

// Set initial layout based on user role if not specified
if (!props.modelValue && layouts.value.length > 0) {
  // Default to operations for regular users, executive for admins
  const defaultLayout = isAdmin.value ? 'executive' : 'operations'
  const availableDefault = layouts.value.find(l => l.value === defaultLayout)
  
  if (availableDefault) {
    selectedLayout.value = defaultLayout
  } else {
    selectedLayout.value = layouts.value[0].value
  }
}
</script>

<style scoped>
.dashboard-layout-switcher {
  display: flex;
  align-items: center;
}

.layout-button {
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-button:not(:last-child) {
  margin-right: 0.25rem;
}

/* Active state animation */
.layout-button:has(.bg-white) {
  transform: translateY(-1px);
}

/* Hover effects */
.layout-button:hover {
  transform: translateY(-0.5px);
}

/* Focus styles */
.layout-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .dashboard-layout-switcher {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>