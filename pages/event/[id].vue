<template>
  <div class="flex flex-col gap-4">
    <EventHeader
      :name="event?.name"
      :description="event?.description"
      :start-date="event?.startDate"
      :end-date="event?.endDate"
      :predictions-close-date="event?.closeDate"
      :image="event?.image" />

    <div v-if="!userEntered && predicionsOpen" class="mx-auto w-full">
      <UAlert
        title="You havn't entered yet!"
        icon="i-heroicons-exclamation-circle"
        color="red"
        variant="solid"
        :actions="[
          {
            size: 'sm',
            variant: 'soft',
            color: 'red',
            label: 'Enter now!',
            to: '/i/' + event?.inviteId,
          },
        ]" />
    </div>
    <UTabs
      :items="tabs"
      class="w-full"
      :default-index="defaultIndex"
      @change="onChange">
      <template #information><EventInformation :event="event" /></template>
      <template #points><EventPoints :event="event" /></template>
      <template #results><EventResults :event="event" /></template>
      <template #predictions><EventPredictions :event="event" /></template>
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
const router = useRouter()
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
  return (event.value?.closeDate ?? new Date()) > new Date()
})

//check if there are any results
const hasResults = computed(() => {
  let hasResults = false
  event.value?.sections.forEach(section => {
    section.questions.forEach(question => {
      const result = useGetResult(question)
      if (result !== null && result !== '' && result !== undefined) {
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

useSeoMeta({
  ogTitle: event.value?.name,
  twitterTitle: event.value?.name,
  twitterImage: event.value?.image ?? '/icon.png',
  ogImage: event.value?.image ?? '/icon.png',
  twitterCard: 'summary_large_image',
})

const tabs = ref([
  {
    label: 'Information',
    disabled: !hasInformation.value,
    slot: 'information',
  },
  {
    label: 'Points',
    disabled: !hasResults.value,
    slot: 'points',
  },
  { label: 'Results', disabled: !hasResults.value, slot: 'results' },
  {
    label: 'Predictions',
    disabled:
      !userEntered.value || (!userEntered.value && !predicionsOpen.value),
    slot: 'predictions',
  },
])

const defaultIndex = computed(() => {
  if (route.hash) {
    const hash = route.hash.slice(1)
    return tabs.value.findIndex(tab => tab.slot === hash) ?? 0
  }
  if (hasInformation.value) return 0
  if (hasResults.value) return 1
  if (userEntered.value) return 3
  return -1
})

function onChange(index: number) {
  if (index === -1 || index === 0) {
    router.push({ hash: '' })
  } else {
    const item = tabs.value[index]
    router.push({ hash: '#' + item.slot })
  }
}
</script>
