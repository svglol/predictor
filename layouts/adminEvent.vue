<template>
  <NuxtLayout name="admin">
    <ul class="flex flex-row space-x-2 mb-2">
      <template
        v-for="(link,i) in links"
        :key="i"
      >
        <NuxtLink
          :to="{ path: link.path }"
          class="font-bold w-full border rounded text-center border-gray-200 dark:border-gray-800 hover:opacity-75"
          active-class="text-primary-500" 
        >
          {{ link.label }}
        </NuxtLink> 
      </template>
    </ul>
    <slot />
  </NuxtLayout>
</template>

<script setup lang="ts">
const paramId = useState('routeParamId')
const links = ref([{ label: 'Edit', path: '/admin/events/' + paramId.value + '/edit' },{ label: 'Entries', path: '/admin/events/' + paramId.value + '/entries' },{label: 'Results', path: '/admin/events/' + paramId.value + '/results'}])
</script>
