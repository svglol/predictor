<template>
  <div>
    <HeadlessTabGroup :selected-index="selectedTab" @change="changeTab">
      <EventHeader :event="event" />
      <div v-if="!userEntered && predicionsOpen" class="my-2">
        <UButton block size="lg" :to="'/i/' + event.inviteId"
          >Submit your prediction!</UButton
        >
      </div>
      <div
        class="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
      >
        <HeadlessTabList class="-mb-px flex flex-wrap">
          <HeadlessTab
            v-for="tab in tabs"
            :key="tab"
            v-slot="{ selected }"
            as="template"
          >
            <button
              class="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300"
              :class="{
                'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500':
                  selected,
              }"
            >
              {{ tab }}
            </button>
          </HeadlessTab>
        </HeadlessTabList>
      </div>
      <div>
        <HeadlessTabPanels>
          <HeadlessTabPanel><EventPoints :event="event" /></HeadlessTabPanel>
          <HeadlessTabPanel
            ><EventPredictions :event="event"
          /></HeadlessTabPanel>
          <HeadlessTabPanel><EventResults :event="event" /></HeadlessTabPanel>
        </HeadlessTabPanels>
      </div>
    </HeadlessTabGroup>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
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
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" })
}

//check if user has entered
const userEntered = ref(
  event.value.entries.filter((entry) => {
    if (entry.userId === user.value?.user?.id) {
      return true
    }
  }).length !== 0
)

//check if predicions are open
const predicionsOpen = computed(() => {
  if (event.value.predictions_close_date === null) return false
  return event.value.predictions_close_date > new Date()
})

useHead({
  title: event.value.name ?? "",
})

const tabs = ref(["Points", "Predictions", "Results"])

const selectedTab = ref(0)

function changeTab(index: number) {
  selectedTab.value = index
  router.push({ hash: `#${tabs.value[index]}` })
}
onMounted(() => {
  if (route.hash) {
    let index =
      tabs.value.findIndex((tab) => tab === route.hash.split("#")[1]) ?? 0
    selectedTab.value = index
  }
})
</script>

<style scoped></style>
