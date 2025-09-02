<script setup lang="ts">
interface Props {
  priority: string;
}

const props = defineProps<Props>();
</script>

<template>
  <UBadge
    :color="
      priority === 'high'
        ? 'error'
        : priority === 'medium'
        ? 'warning'
        : 'success'
    "
    variant="subtle"
    >{{ convertToTitleCase(priority) }}</UBadge
  >
</template>