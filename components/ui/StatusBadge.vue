<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const normalizeStatus = (val) => {
  if (!val) return "";
  return val.toLowerCase().replace(/\s+/g, "_");
};
</script>

<template>
  <UBadge
    :color="
      normalizeStatus(status) === 'completed'
        ? 'success'
        : normalizeStatus(status) === 'for_revision'
        ? 'warning'
        : normalizeStatus(status) === 'for_checking'
        ? 'info'
        : normalizeStatus(status) === 'on_going'
        ? 'primary'
        : normalizeStatus(status) === 'pending'
        ? 'neutral'
        : normalizeStatus(status) === 'cancelled'
        ? 'error'
        : 'neutral'
    "
    variant="subtle"
  >
    {{ convertToTitleCase(normalizeStatus(status)) }}
  </UBadge>
</template>
