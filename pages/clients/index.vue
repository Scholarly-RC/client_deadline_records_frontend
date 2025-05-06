<script setup>
import ClientTable from "~/components/clients/ClientTable.vue";

definePageMeta({
  layout: "menu",
  middleware: "auth",
});
</script>

<template>
  <ClientTable />
</template>
