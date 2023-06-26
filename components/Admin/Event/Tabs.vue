<template>
  <div
    class="mb-2 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
  >
    <div class="-mb-px flex flex-wrap">
      <template v-for="(link, i) in links" :key="i">
        <NuxtLink
          :to="{ path: link.path }"
          class="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
          active-class="border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500 focus:outline-none"
        >
          {{ link.label }}
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const links = ref([
  { label: "Edit", path: "/admin/event/" + route.params.id + "/edit" },
  {
    label: "Information",
    path: "/admin/event/" + route.params.id + "/info",
  },
  { label: "Entries", path: "/admin/event/" + route.params.id + "/entries" },
  { label: "Results", path: "/admin/event/" + route.params.id + "/results" },
])
</script>

<style></style>
