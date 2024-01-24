<template>
  <div>
    <UTable :rows="optionSetsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="Edit"
          color="gray"
          variant="ghost"
          icon="material-symbols:edit"
          @click="(selectedOptionSet = row)((optionSetModal = true))" />
        <UButton
          :disabled="event?.visible"
          label="Delete"
          color="gray"
          variant="ghost"
          icon="material-symbols:delete"
          @click="(selectedOptionSet = row)((deleteModal = true))" />
      </template>

      <template #options-data="{ row }">
        {{ row.options?.length ?? 0 }}
      </template>
    </UTable>
    <div class="my-2 flex flex-row-reverse">
      <div class="flex flex-row">
        <UButton
          icon="material-symbols:add"
          size="sm"
          color="primary"
          variant="solid"
          label="Add new option set"
          :trailing="false"
          class="ml-auto"
          @click="addOptionSet" />
      </div>
    </div>

    <OptionSetModalVue
      v-model="optionSetModal"
      :loading="loading"
      :selected-option-set="selectedOptionSet"
      @update="updateOptionSet"
      @addoption="addOption"
      @deleteoption="deleteOption" />

    <DeleteModal
      v-model="deleteModal"
      text="Are you sure you want to delete this option set?"
      placeholder-text="Option Set Name"
      :input-match="selectedOptionSet?.title ?? ''"
      @delete="deleteOptionSet" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin-event',
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const { $client } = useNuxtApp()
const route = useRoute()
const id = route.params.id

const { data: event } = await $client.events.getEvent.useQuery(Number(id))
const { data: optionSets, refresh } = await useAsyncData(() =>
  $client.events.getOptionSetsForEvent.query({ eventId: Number(id) })
)
const optionSetsComputed = computed(() => optionSets.value ?? [])

useHead({
  title: event.value?.name + ' - Option Sets',
})

const columns = [
  {
    key: 'id',
    label: 'ID',
  },
  {
    key: 'title',
    label: 'Title',
  },
  { key: 'options', label: 'Options' },
  {
    key: 'actions',
    label: 'Actions',
  },
]
const optionSetModal = ref(false)
const deleteModal = ref(false)
const selectedOptionSet: Ref<OptionSet | null> = ref(null)
const loading = ref(false)

async function addOptionSet() {
  const optionSet = await $client.events.addOptionSet.mutate({
    title: 'New option set',
    eventId: Number(id),
  })
  if (optionSet) {
    optionSetsComputed.value.push(optionSet)
    selectedOptionSet.value = optionSet
    optionSetModal.value = true
  }
}
async function updateOptionSet(optionSet: OptionSet) {
  loading.value = true
  for (const option of optionSet.options) {
    $client.events.updateOption.mutate({
      id: option.id,
      title: option.title,
      order: option.order,
    })
  }
  const mutate = await $client.events.updateOptionSet.mutate({
    id: Number(selectedOptionSet.value?.id),
    title: optionSet?.title ?? '',
  })
  if (mutate) {
    const optionSet = optionSets.value?.find(
      predicate => predicate.id === mutate.id
    )
    if (optionSet) {
      optionSet.title = mutate.title
      optionSet.options = mutate.options
    }

    selectedOptionSet.value = mutate
    const toast = useToast()
    toast.add({ title: 'Optionset Saved Successfully!' })
    await refresh()
    loading.value = false
    optionSetModal.value = false
  }
}
async function addOption(option: Option) {
  loading.value = true
  const newOption = await $client.events.addOption.mutate({
    optionSetId: Number(selectedOptionSet.value?.id),
    title: option.title,
    order: option.order,
  })
  if (newOption && selectedOptionSet.value) {
    selectedOptionSet.value.options.push(newOption)
    loading.value = false
  }
}
async function deleteOption(id: number) {
  loading.value = true
  const option = await $client.events.deleteOption.mutate(id)
  if (option && selectedOptionSet.value) {
    selectedOptionSet.value.options = selectedOptionSet.value.options.filter(
      option => option.id !== id
    )
    loading.value = false
  }
}

async function deleteOptionSet() {
  deleteModal.value = false
  loading.value = true
  const mutate = await $client.events.deleteOptionSet.mutate(
    Number(selectedOptionSet.value?.id)
  )
  if (mutate && optionSets.value) {
    optionSets.value = optionSets.value.filter(
      optionSet => optionSet.id !== mutate.id
    )
    loading.value = false
  }
}
</script>
