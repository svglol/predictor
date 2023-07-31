<template>
  <div>
    <NuxtLayout name="admin">
      <div>
        <AdminEventTabs :id="id" />
        <div>
          <slot />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)
</script>
