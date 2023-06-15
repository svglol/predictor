<template>
  <div>invite landing page</div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
    return /^[a-zA-Z0-9\b]{5}$/.test(String(route.params.id))
  },
})
</script>

<style scoped></style>
