<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="event?.name">
      <UButton
        icon="carbon:document-import"
        size="sm"
        color="primary"
        variant="solid"
        label="Import Option Set"
        :trailing="false"
        class="ml-auto"
        :disabled="disabled"
        @click="importModal = true" />
      <UButton
        icon="material-symbols:add"
        size="sm"
        color="primary"
        variant="solid"
        label="Add new option set"
        :trailing="false"
        :disabled="disabled"
        class="ml-auto"
        @click="addOptionSet" />
    </AdminEventHeader>
    <UTable :rows="optionSetsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="Edit"
          color="gray"
          variant="ghost"
          :disabled="disabled"
          icon="material-symbols:edit"
          @click="editOptionSet(row)" />
        <UButton
          :disabled="disabled"
          label="Delete"
          color="gray"
          variant="ghost"
          icon="material-symbols:delete"
          @click="openDeleteModal(row)" />
      </template>

      <template #options-data="{ row }">
        {{ row.options?.length ?? 0 }}
      </template>
    </UTable>

    <ModalOptionSet
      v-model="optionSetModal"
      :loading="loading"
      :selected-option-set="selectedOptionSet"
      :title="selectedOptionSet?.title ?? ''"
      @update="updateOptionSet"
      @addoption="addOption"
      @deleteoption="deleteOption" />

    <ModalDelete
      v-model="deleteModal"
      text="Are you sure you want to delete this option set?"
      placeholder-text="Option Set Name"
      :input-match="selectedOptionSet?.title ?? ''"
      @delete="deleteOptionSet" />

    <ModalImportOptionSet
      v-model="importModal"
      :event-id="Number(id)"
      @import-option-set="importOptionSet" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: route => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})
const { $client } = useNuxtApp()
const route = useRoute()
const id = route.params.id

const { data: event } = await $client.eventsAdmin.getEvent.useQuery(Number(id))
const { data: optionSets, refresh } = await useAsyncData(() =>
  $client.eventsAdmin.getOptionSetsForEvent.query({ eventId: Number(id) })
)
const optionSetsComputed = computed(() => optionSets.value ?? [])

const disabled = computed(() => {
  if (event.value?.status === 'FINISHED') {
    return true
  }
  return false
})
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
const importModal = ref(false)
const selectedOptionSet: Ref<OptionSet | null> = ref(null)
const loading = ref(false)

async function addOptionSet() {
  const optionSet = await $client.eventsAdmin.addOptionSet.mutate({
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
    $client.eventsAdmin.updateOption.mutate({
      id: option.id,
      title: option.title,
      order: option.order,
    })
  }
  const mutate = await $client.eventsAdmin.updateOptionSet.mutate({
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
  const newOption = await $client.eventsAdmin.addOption.mutate({
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
  const option = await $client.eventsAdmin.deleteOption.mutate(id)
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
  const mutate = await $client.eventsAdmin.deleteOptionSet.mutate(
    Number(selectedOptionSet.value?.id)
  )
  if (mutate && optionSets.value) {
    optionSets.value = optionSets.value.filter(
      optionSet => optionSet.id !== mutate.rowsAffected
    )
    loading.value = false
  }
}

async function importOptionSet(title: string, options: Option[]) {
  importModal.value = false
  await $client.eventsAdmin.importOptionSet.mutate({
    eventId: Number(id),
    title,
    options: options.map(o => ({ title: o.title, order: o.order })),
  })
  refresh()
}

function editOptionSet(optionSet: OptionSet) {
  selectedOptionSet.value = optionSet
  optionSetModal.value = true
}

function openDeleteModal(optionSet: OptionSet) {
  selectedOptionSet.value = optionSet
  deleteModal.value = true
}
</script>
