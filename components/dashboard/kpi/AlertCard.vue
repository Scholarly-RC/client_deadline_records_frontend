<template>
  <UCard :class="cardClasses">
    <div class="alert-content">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <!-- Alert Icon -->
        <div :class="iconClasses">
          <UIcon :name="alertIcon" class="w-5 h-5" />
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Title and Badge -->
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
            <UBadge :color="severityColor" :variant="badgeVariant">{{ severityLabel }}</UBadge>
          </div>
          
          <!-- Message -->
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">{{ message }}</p>
          
          <!-- Details -->
          <div v-if="details && details.length" class="details-section mb-4">
            <div class="space-y-2">
              <div 
                v-for="detail in details" 
                :key="detail.label"
                class="flex justify-between items-center text-sm"
              >
                <span class="text-gray-500 dark:text-gray-400">{{ detail.label }}</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ detail.value }}</span>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar (for progress-type alerts) -->
          <div v-if="showProgress" class="progress-section mb-4">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{{ progressLabel }}</span>
              <span>{{ progressValue }}/{{ progressMax }}</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                :class="progressBarClasses"
                :style="{ width: `${progressPercentage}%` }"
                class="h-2 rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
          
          <!-- Timestamp -->
          <div v-if="timestamp" class="timestamp text-xs text-gray-400 dark:text-gray-500 mb-3">
            <UIcon name="mdi:clock-outline" class="w-3 h-3 inline mr-1" />
            {{ formattedTimestamp }}
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div v-if="actions && actions.length" class="actions-section mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div class="flex flex-wrap gap-2">
          <UButton 
            v-for="action in actions"
            :key="action.label"
            :label="action.label"
            :variant="action.variant || 'outline'"
            :color="action.color || 'gray'"
            size="sm"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :loading="action.loading"
          >
            <template v-if="action.icon" #leading>
              <UIcon :name="action.icon" />
            </template>
          </UButton>
        </div>
      </div>
      
      <!-- Dismissible -->
      <UButton 
        v-if="dismissible"
        @click="handleDismiss"
        variant="ghost"
        size="sm"
        icon="mdi:close"
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        square
      />
    </div>
  </UCard>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, error, critical
  },
  severity: {
    type: String,
    default: 'medium', // low, medium, high, critical
  },
  details: {
    type: Array,
    default: () => []
  },
  actions: {
    type: Array,
    default: () => []
  },
  timestamp: {
    type: [Date, String],
    default: null
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progressValue: {
    type: Number,
    default: 0
  },
  progressMax: {
    type: Number,
    default: 100
  },
  progressLabel: {
    type: String,
    default: 'Progress'
  },
  badgeVariant: {
    type: String,
    default: 'subtle'
  }
})

const emit = defineEmits(['action', 'dismiss'])

const cardClasses = computed(() => {
  const base = 'alert-card relative transition-all duration-200 hover:shadow-md'
  
  const typeClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    critical: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
  }
  
  return `${base} ${typeClasses[props.type] || typeClasses.info}`
})

const iconClasses = computed(() => {
  const base = 'flex-shrink-0 p-2 rounded-full'
  
  const typeClasses = {
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200',
    success: 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-200',
    error: 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200',
    critical: 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100'
  }
  
  return `${base} ${typeClasses[props.type] || typeClasses.info}`
})

const alertIcon = computed(() => {
  const icons = {
    info: 'mdi:information-outline',
    success: 'mdi:check-circle-outline',
    warning: 'mdi:alert-outline',
    error: 'mdi:close-circle-outline',
    critical: 'mdi:alert-octagon-outline'
  }
  
  return icons[props.type] || icons.info
})

const severityColor = computed(() => {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  }
  
  return colors[props.severity] || colors.medium
})

const severityLabel = computed(() => {
  return props.severity.charAt(0).toUpperCase() + props.severity.slice(1)
})

const progressPercentage = computed(() => {
  if (props.progressMax === 0) return 0
  return Math.min(Math.round((props.progressValue / props.progressMax) * 100), 100)
})

const progressBarClasses = computed(() => {
  const percentage = progressPercentage.value
  
  if (percentage >= 80) {
    return 'bg-green-500'
  } else if (percentage >= 60) {
    return 'bg-blue-500'
  } else if (percentage >= 40) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
})

const formattedTimestamp = computed(() => {
  if (!props.timestamp) return ''
  
  const date = new Date(props.timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
})

const handleAction = (action) => {
  emit('action', action)
}

const handleDismiss = () => {
  emit('dismiss')
}
</script>

<style scoped>
@reference "tailwindcss";

.alert-card {
  @apply rounded-lg shadow-sm border overflow-hidden;
}

.alert-content {
  @apply select-none;
}

/* Hover effects */
.alert-card:hover {
  @apply transform scale-[1.01];
}

/* Critical alert animation */
.alert-card:has(.bg-red-100) {
  animation: pulse-subtle 3s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.005);
  }
}
</style>