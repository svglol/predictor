<template>
  <NuxtLayout name="admin">
    <div
      class="mb-2 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
    >
      <div class="-mb-px flex flex-wrap">
        <template v-for="(link, i) in links" :key="i">
          <NuxtLink
            :to="{ path: link.path }"
            class="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
            active-class="border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500"
          >
            {{ link.label }}
          </NuxtLink>
        </template>
      </div>
    </div>
    <slot />
  </NuxtLayout>
</template>

<script setup lang="ts">
const paramId = useState("routeParamId")
const links = ref([
  { label: "Edit", path: "/admin/event/" + paramId.value + "/edit" },
  { label: "Entries", path: "/admin/event/" + paramId.value + "/entries" },
  { label: "Results", path: "/admin/event/" + paramId.value + "/results" },
])
</script>
