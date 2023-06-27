<template>
  <NuxtLayout name="admin">
    <AdminEventTabs :id="id" />
    <slot />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)
</script>

<style></style>
