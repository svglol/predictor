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
        @click="openImportModal"
      />
      <UButton
        icon="material-symbols:add"
        size="sm"
        color="primary"
        variant="solid"
        label="Add new option set"
        :trailing="false"
        :disabled="disabled"
        class="ml-auto"
        @click="addOptionSet"
      />
    </AdminEventHeader>
    <UTable :rows="optionSetsComputed" :columns="columns" class="w-full">
      <template #actions-data="{ row }">
        <UButton
          label="Edit"
          color="gray"
          variant="ghost"
          :disabled="disabled"
          icon="material-symbols:edit"
          @click="openOptionSetModal(row)"
        />
        <UButton
          :disabled="disabled"
          label="Delete"
          color="gray"
          variant="ghost"
          icon="material-symbols:delete"
          @click="openDeleteModal(row)"
        />
      </template>

      <template #options-data="{ row }">
        {{ row.options?.length ?? 0 }}
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { ModalDelete, ModalImportOptionSet, ModalOptionSet } from '#components'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})
const { $client } = useNuxtApp()
const route = useRoute()
const id = route.params.id
const modal = useModal()

const { data: event } = await $client.eventsAdmin.getEvent.useQuery(Number(id))
const { data: optionSets, refresh } = await useAsyncData(() =>
  $client.eventsAdmin.getOptionSetsForEvent.query({ eventId: Number(id) }),
)
const optionSetsComputed = computed(() => optionSets.value ?? [])

const disabled = computed(() => {
  if (event.value?.status === 'FINISHED')
    return true

  return false
})
useHead({
  title: `${event.value?.name} - Option Sets`,
})

const columns = [
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
const loading = ref(false)

async function addOptionSet() {
  const optionSet = await $client.eventsAdmin.addOptionSet.mutate({
    title: 'New option set',
    eventId: Number(id),
  })
  if (optionSet) {
    optionSetsComputed.value.push(optionSet)
    openOptionSetModal(optionSet)
  }
}

async function deleteOptionSet(id: number) {
  loading.value = true
  const mutate = await $client.eventsAdmin.deleteOptionSet.mutate(id)
  if (mutate && optionSets.value) {
    optionSets.value = optionSets.value.filter(
      optionSet => optionSet.id !== mutate.rowsAffected,
    )
    loading.value = false
  }
}

async function importOptionSet(title: string, options: Option[]) {
  await $client.eventsAdmin.importOptionSet.mutate({
    eventId: Number(id),
    title,
    options: options.map(o => ({ title: o.title, order: o.order })),
  })
  refresh()
}

function openDeleteModal(optionSet: OptionSet) {
  modal.open(ModalDelete, {
    text: 'Are you sure you want to delete this option set?',
    placeholderText: 'Option Set Name',
    inputMatch: optionSet.title ?? '',
    deleteFn: async () => {
      await deleteOptionSet(optionSet.id)
      modal.close()
    },
  })
}

function openImportModal() {
  modal.open(ModalImportOptionSet, {
    import: async (title, options) => {
      await importOptionSet(title, options)
      modal.close()
    },
    close: () => {
      modal.close()
    },
  })
}

function openOptionSetModal(optionSet: OptionSet) {
  modal.open(ModalOptionSet, {
    title: optionSet.title ?? 'New Option Set',
    // @ts-expect-error this is a model value not a prop
    selectedOptionSet: optionSet,
    close: () => {
      modal.close()
    },
  })
}
</script>
