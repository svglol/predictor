<template>
  <div>User</div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin",
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})
</script>

<style scoped></style>
