<template>
  <div class="flex flex-col">
    <div
      v-if="title"
      class="flex w-full flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex flex-row items-center gap-2 p-4">
        <UBreadcrumb
          :links="breadcrumbItems"
          :ui="{
            li: '!text-lg text-black dark:text-white',
            active: '!text-lg font-bold dark:text-white text-black',
          }"
        >
          <template #divider>
            <UIcon name="heroicons-outline:chevron-right" />
          </template>
        </UBreadcrumb>
        <slot name="badges" />
      </div>
      <div class="mx-2 flex flex-wrap gap-2">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title?: string | null | undefined
}>()

const route = useRoute()
const id = computed(() => route.params.id)

const breadcrumbItems = computed(() => [
  {
    label: 'Users',
    to: '/admin/user/',
  },
  {
    label: props.title ?? 'User',
    to: `/admin/user/${id.value}`,
  },
])
</script>
