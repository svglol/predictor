<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})
navigateTo("/admin/event/" + useRoute().params.id + "/edit", {
  replace: true,
})
</script>

<style scoped></style>
