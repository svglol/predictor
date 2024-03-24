<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  pageTransition: false,
})

navigateTo('/admin/event/', {
  replace: true,
})
</script>
