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
    <div v-if="userEntered && predicionsOpen" class="mx-auto w-full">
      <UAlert
        title="Update your entry up until predictions close!"
        icon="i-heroicons-exclamation-circle"
        color="green"
        variant="solid"
        :actions="[
          {
            size: 'sm',
            variant: 'soft',
            color: 'green',
            label: 'Update entry',
            to: '/i/' + event?.inviteId,
          },
        ]" />
    </div>
    <UTabs
      v-model="selected"
      :items="tabs"
      class="w-full"
      :default-index="defaultIndex">
      <template #information>
        <EventInformation
          :information="event?.information"
          class="prose max-w-full rounded-lg border border-gray-200 bg-white p-6 shadow dark:prose-invert focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
      </template>
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
    disabled: predicionsOpen.value,
    slot: 'predictions',
  },
])

const defaultIndex = computed(() => {
  if (hasResults.value) return 1
  if (hasInformation.value) return 0
  if (userEntered.value) return 3
  return -1
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
