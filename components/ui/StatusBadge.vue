<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <UBadge
    :color="
      status === 'completed'
        ? 'success'
        : status === 'for_revision'
        ? 'warning'
        : status === 'for_checking'
        ? 'info'
        : status === 'on_going'
        ? 'primary'
        : status === 'pending'
        ? 'yellow'
        : status === 'cancelled'
        ? 'error'
        : 'neutral'
    "
    variant="subtle"
    >{{ convertToTitleCase(status) }}</UBadge
  >
</template>
