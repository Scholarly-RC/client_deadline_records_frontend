<script setup>
const props = defineProps({
  priority: {
    type: String,
    required: true,
  },
});
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
