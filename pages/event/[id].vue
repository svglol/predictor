<template>
  <div class="flex flex-col">
    <EventHeader
      :name="event?.name"
      :description="event?.description"
      :start-date="event?.startDate"
      :end-date="event?.endDate"
      :predictions-close-date="event?.closeDate"
      :image="event?.image" />
    <div v-if="!userEntered && predicionsOpen" class="mx-auto my-2">
      <UButton block size="sm" :to="'/i/' + event?.inviteId">
        Submit your prediction!
      </UButton>
    </div>
    <UTabs :items="tabs" class="mt-2 w-full">
      <template #information="{}"><EventInformation :event="event" /></template>
      <template #points="{}"><EventPoints :event="event" /></template>
      <template #results="{}"><EventResults :event="event" /></template>
      <template #predictions="{}"><EventPredictions :event="event" /></template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const { $client } = useNuxtApp()
const route = useRoute()
const { session: user } = useAuth()

const { data: event } = await $client.events.getEvent.useQuery(
  Number(route.params.id)
)

//check if event is valid
if (event.value === null || !event.value.visible) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

//check if user has entered
const userEntered = ref(
  event.value.entries.filter(entry => {
    if (entry.userId === user.value?.user?.id) {
      return true
    }
  }).length !== 0
)

//check if predicions are open
const predicionsOpen = computed(() => {
  if (event.value?.closeDate === null) return false
  return event.value?.closeDate ?? new Date() > new Date()
})

//check if there are any results
const hasResults = computed(() => {
  let hasResults = false
  event.value?.sections.forEach(section => {
    section.questions.forEach(question => {
      const result = useGetResult(question)
      if (result !== null && result !== '') {
        hasResults = true
      }
    })
  })
  return hasResults
})

const hasInformation = computed(() => {
  if (event.value?.information === null) return false
  if (event.value?.information === '') return false
  if (event.value?.information !== '<p></p>') {
    return true
  }
  return false
})

useHead({
  title: event.value.name ?? '',
})

const tabs = ref([
  {
    label: 'Information',
    disabled: !hasInformation.value,
    slot: 'information',
  },
  { label: 'Points', disabled: !hasResults.value, slot: 'points' },
  { label: 'Results', disabled: !hasResults.value, slot: 'results' },
  {
    label: 'Predictions',
    disabled:
      !userEntered.value || (!userEntered.value && !predicionsOpen.value),
    slot: 'predictions',
  },
])
</script>
