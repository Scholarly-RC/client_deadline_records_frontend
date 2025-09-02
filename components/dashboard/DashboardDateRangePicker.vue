<script setup lang="ts">
import { shallowRef, watch, computed } from 'vue'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

interface Props {
  selectedDateRange: { start: string | null; end: string | null }
  isLoading?: boolean
}

interface Emits {
  (e: 'update:start-date', value: string | null): void
  (e: 'update:end-date', value: string | null): void
  (e: 'clear-filters'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<Emits>()

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = shallowRef<{ start: CalendarDate; end: CalendarDate } | null>(null)

// Watch for changes in props and update the model
watch(() => props.selectedDateRange, (newRange) => {
  if (newRange.start && newRange.end) {
    modelValue.value = {
      start: parseDate(newRange.start),
      end: parseDate(newRange.end)
    }
  } else {
    modelValue.value = null
  }
}, { immediate: true })

// Watch for changes in model and emit events
watch(modelValue, (newValue) => {
  if (newValue?.start && newValue?.end) {
    const startDate = newValue.start.toString()
    const endDate = newValue.end.toString()
    emit('update:start-date', startDate)
    emit('update:end-date', endDate)
  } else {
    emit('update:start-date', null)
    emit('update:end-date', null)
  }
})

// Handle clear filters
const handleClearFilters = () => {
  emit('clear-filters')
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return props.selectedDateRange.start !== null || props.selectedDateRange.end !== null
})


</script>

<template>
  <div class="flex items-center gap-3">
    <!-- Date Range Picker -->
    <UPopover>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-calendar"
        :disabled="isLoading"
      >
        <template v-if="modelValue?.start">
          <template v-if="modelValue?.end">
            {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }} - {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
          </template>
          <template v-else>
            {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
          </template>
        </template>
        <template v-else>
          Pick a date range
        </template>
      </UButton>

      <template #content>
        <UCalendar
          v-model="modelValue"
          class="p-2"
          :number-of-months="2"
          range
        />
      </template>
    </UPopover>

    <!-- Clear Filters Button -->
    <UButton
      v-if="hasActiveFilters"
      variant="outline"
      size="sm"
      @click="handleClearFilters"
      :disabled="isLoading"
    >
      <UIcon name="mdi:filter-off" class="mr-2" />
      Clear
    </UButton>

  </div>
</template>

<style scoped>
/* Calendar popover styles */
</style>