<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        Import Option Set From Event
      </template>
      <div class="flex flex-col space-y-2">
        <UFormGroup name="event" label="Event">
          <USelect
            v-model="selectedEvent"
            :options="eventsOptions"
            :disabled="eventsOptions.length === 0"
          />
        </UFormGroup>
        <UFormGroup name="optionSet" label="Option Set">
          <USelect
            v-model="optionSetSelected"
            :options="optionSetsNames"
            :disabled="optionSetsNames.length === 0"
          />
        </UFormGroup>
      </div>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            icon="carbon:document-import"
            class="self-end"
            :disabled="
              optionSetsNames.length === 0
                || optionSetSelected === null
                || optionSetsData === null
                || importing
            "
            :loading="importing"
            @click="importOptionSet"
          >
            Import
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  close: () => void
  import: (title: string, options: Option[]) => Promise<void>
}>()

const importing = ref(false)

const { data: events } = await useClient().eventsAdmin.getEvents.useQuery()

const eventsOptions
  = events.value
    ?.sort((a, b) => b.id - a.id)
    .map(e => ({ label: e.name, value: e.id })) ?? []
const selectedEvent = ref(eventsOptions?.[0].value ?? 0)

const optionSetsNames = ref([]) as Ref<
  { label: string | null, value: number | null }[]
>
const optionSetSelected = ref()
const optionSetsData = ref([]) as Ref<OptionSet[] | null>
watchEffect(async () => {
  const { data: optionSets }
    = await useClient().eventsAdmin.getOptionSetsForEvent.useQuery({
      eventId: Number(selectedEvent.value),
    })
  optionSetsData.value = optionSets.value
  optionSetsNames.value
    = optionSets.value
      ?.filter(s => s.options.length > 0)
      .map(s => ({
        label: s.title,
        value: s.id,
      })) ?? []
  if (optionSetsNames.value.length > 0)
    optionSetSelected.value = optionSetsNames.value?.[0].value ?? null
  else optionSetSelected.value = null
})

function importOptionSet() {
  importing.value = true
  if (optionSetsData.value === null)
    return
  const optionSet = optionSetsData.value.find(
    s => s.id === Number(optionSetSelected.value),
  )
  if (optionSet === undefined)
    return
  props.import(optionSet?.title ?? '', optionSet?.options ?? [])
  importing.value = false
}
</script>
