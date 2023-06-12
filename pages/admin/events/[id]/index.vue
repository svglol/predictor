<template>
  <div />
</template>
  
  <script setup lang="ts">
  definePageMeta({
      middleware: ['admin'],
      layout: 'admin-event',
  })
  navigateTo('/admin/events/' + useRoute().params.id + '/edit')
  </script>
  
  <style scoped>
  
  </style>