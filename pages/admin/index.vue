<template><div></div></template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
})

navigateTo('/admin/event/', {
  replace: true,
})
</script>
