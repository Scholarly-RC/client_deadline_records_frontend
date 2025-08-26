<script setup>
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
const showCompleted = ref(false);

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const dateRange = shallowRef({});
</script>

<template>
  <UModal title="Filter" description="Filter deadlines">
    <UButton label="Filter" />
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField name="show_completed" label="Show Completed">
          <USwitch
            :label="showCompleted ? 'Show' : 'Hidden'"
            size="xl"
            v-model:model-value="showCompleted"
          />
        </UFormField>
        <UFormField name="date_range" label="Date Range">
          <UPopover>
            <UButton color="neutral" variant="subtle" icon="i-lucide-calendar">
              <template v-if="dateRange.start">
                <template v-if="dateRange.end">
                  {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }} -
                  {{
                    df.format(
                      modelVadateRangelue.end.toDate(getLocalTimeZone())
                    )
                  }}
                </template>

                <template v-else>
                  {{ df.format(dateRange.start.toDate(getLocalTimeZone())) }}
                </template>
              </template>
              <template v-else> Pick a date </template>
            </UButton>

            <template #content>
              <UCalendar
                v-model="dateRange"
                class="p-2"
                :number-of-months="2"
                range
              />
            </template>
          </UPopover>
        </UFormField>
      </div>
    </template>
  </UModal>
</template>
