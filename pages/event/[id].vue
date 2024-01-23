<template>
  <div>
    <UCard :ui="{ header: { padding: '!p-0' } }">
      <template #header>
        <EventHeader
          :name="event?.name"
          :description="event?.description"
          :start-date="event?.startDate"
          :end-date="event?.endDate"
          :predictions-close-date="event?.closeDate"
          :image="event?.image" />
        <UTabs
          v-model="selected"
          :items="tabs"
          class="w-full"
          :ui="{ wrapper: 'space-y-0' }"
          :default-index="defaultIndex"></UTabs>
      </template>
      <UTabs
        v-model="selected"
        :items="tabs"
        class="w-full"
        :ui="{
          wrapper: 'space-y-0',
          list: {
            base: 'hidden',
          },
        }"
        :default-index="defaultIndex">
        <template #information>
          <EventInformation :information="event?.information" />
        </template>
        <template #entry-form>
          <EventEntryForm
            v-if="status === 'authenticated'"
            :event="event"
            @update="refresh" />
          <EventEntryLogin v-else />
        </template>
        <template #points><EventPoints :event="event" /></template>
        <template #results><EventResults :event="event" /></template>
        <template #predictions><EventPredictions :event="event" /></template>
      </UTabs>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async route => {
    return /^\d+$/.test(String(route.params.id))
  },
})
const { status } = useAuth()
const { $client } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const { data: event, refresh } = await $client.events.getEvent.useQuery(
  Number(route.params.id)
)

//check if event is valid
if (event.value === null || !event.value.visible) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

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
  twitterCard: 'summary_large_image',
  ogDescription: event.value?.description,
  twitterDescription: event.value?.description,
})

defineOgImage({
  component: 'OgImageEvent',
  props: {
    title: event.value.name ?? '',
    description: event.value.description,
    src: event.value.image,
  },
})

watch(predicionsOpen, () => {})

const tabs = computed(() => {
  const items = []
  if (hasInformation.value) {
    items.push({
      label: 'Information',
      slot: 'information',
    })
  }
  if (predicionsOpen.value) {
    items.push({
      label: 'Entry Form',
      slot: 'entry-form',
    })
  }
  if (hasResults.value) {
    items.push({
      label: 'Points',
      slot: 'points',
    })
    items.push({
      label: 'Results',
      slot: 'results',
    })
    items.push({
      label: 'Predictions',
      slot: 'predictions',
    })
  }
  return items
})

const defaultIndex = computed(() => {
  if (hasInformation.value)
    return tabs.value.findIndex(item => item.label === 'Information')
  if (predicionsOpen.value)
    return tabs.value.findIndex(item => item.label === 'Entry Form')
  if (hasResults.value)
    return tabs.value.findIndex(item => item.label === 'Points')
  return 0
})

const selected = computed({
  get() {
    const index = tabs.value.findIndex(item => item.label === route.query.tab)
    if (index === -1) {
      return 0
    }
    return index
  },
  set(value) {
    router.replace({
      query: { tab: tabs.value[value].label },
      hash: '',
    })
  },
})
</script>
