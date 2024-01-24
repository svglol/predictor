<template>
  <div
    class="mb-2 border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
    <div class="-mb-px flex flex-wrap">
      <template v-for="(link, i) in links" :key="i">
        <NuxtLink
          :to="{ name: link.name, params: { id: props.id } }"
          class="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
          active-class="border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500 focus:outline-none">
          {{ link.label }}
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  id: string | string[]
}
const props = withDefaults(defineProps<Props>(), {
  id: '1',
})

const links = computed(() => [
  { label: 'Edit', name: 'admin-event-id' },
  { label: 'Form', name: 'admin-event-id-form' },
  { label: 'Option Sets', name: 'admin-event-id-optionsets' },
  { label: 'Entries', name: 'admin-event-id-entries' },
  { label: 'Results', name: 'admin-event-id-results' },
])
</script>
