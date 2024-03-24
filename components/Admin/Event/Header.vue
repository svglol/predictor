<template>
  <div class="flex flex-col">
    <div
      v-if="title"
      class="flex w-full flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4 dark:border-gray-800"
    >
      <div class="flex flex-row items-center gap-2">
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
      <div class="flex flex-wrap gap-2">
        <slot />
      </div>
    </div>

    <div
      class="flex w-full flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800"
    >
      <UHorizontalNavigation
        :links="links"
        class="hidden px-2 sm:flex sm:w-fit"
      />
      <UDropdown
        :items="dropdownItems"
        :popper="{ placement: 'bottom-start' }"
        class="block p-2 sm:hidden"
      >
        <UButton
          color="white"
          :label="getCurrentLink?.label ?? 'Event Options'"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />
      </UDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title?: string | null | undefined
}>()

const route = useRoute()
const id = computed(() => route.params.id)
const links = computed(() => [
  { label: 'Edit', to: `/admin/event/${id.value}` },
  { label: 'Form', to: `/admin/event/${id.value}/form` },
  { label: 'Option Sets', to: `/admin/event/${id.value}/optionsets` },
  { label: 'Entries', to: `/admin/event/${id.value}/entries` },
  { label: 'Results', to: `/admin/event/${id.value}/results` },
])

const dropdownItems = computed(() => [links.value])

const getCurrentLink = computed(() => {
  return links.value.find(link => link.to === route.path)
})

const breadcrumbItems = computed(() => [
  {
    label: 'Events',
    to: '/admin/event/',
  },
  {
    label: props.title ?? 'Event',
    to: `/admin/event/${id.value}`,
  },
])
</script>
