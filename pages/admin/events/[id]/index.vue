<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
})
navigateTo("/admin/events/" + useRoute().params.id + "/edit", {
  replace: true,
})
</script>

<style scoped></style>
