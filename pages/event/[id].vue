<template>
  <div class="flex flex-col">
    <HeadlessTabGroup>
      <EventHeader
        :name="event?.name"
        :description="event?.description"
        :start-date="event?.startDate"
        :end-date="event?.endDate"
        :predictions-close-date="event?.predictionsCloseDate"
      />
      <div v-if="!userEntered && predicionsOpen" class="mx-auto my-2">
        <UButton block size="sm" :to="'/i/' + event.inviteId"
          >Submit your prediction!</UButton
        >
      </div>
      <div
        class="border-b border-gray-200 text-center text-sm font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
      >
        <HeadlessTabList class="-mb-px flex flex-wrap">
          <HeadlessTab
            v-for="tab in tabs"
            :key="tab.name"
            v-slot="{ selected }"
            as="template"
            :disabled="tab.disabled"
          >
            <button
              class="inline-block rounded-t-lg border-b-2 border-transparent p-4 hover:border-gray-300 hover:text-gray-600 focus:outline-none dark:hover:text-gray-300"
              :class="{
                'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500 hover:text-primary-600 dark:hover:text-primary-500 focus:outline-none':
                  selected,
                'cursor-not-allowed text-gray-300 hover:border-transparent hover:text-gray-300 dark:text-gray-700 hover:dark:text-gray-700':
                  tab.disabled,
              }"
            >
              {{ tab.name }}
            </button>
          </HeadlessTab>
        </HeadlessTabList>
      </div>
      <div>
        <HeadlessTabPanels>
          <HeadlessTabPanel
            v-slot="{ selected }"
            as="template"
            :unmount="false"
          >
            <HeadlessTransitionRoot
              appear
              :show="selected"
              enter="tab-enter"
              enter-to="tab-enter-to"
              enter-from="tab-enter-from"
              :unmount="false"
            >
              <EventInformation :event="event" />
            </HeadlessTransitionRoot>
          </HeadlessTabPanel>
          <HeadlessTabPanel
            v-slot="{ selected }"
            as="template"
            :unmount="false"
          >
            <HeadlessTransitionRoot
              appear
              :show="selected"
              enter="tab-enter"
              enter-to="tab-enter-to"
              enter-from="tab-enter-from"
              :unmount="false"
            >
              <EventPoints :event="event" />
            </HeadlessTransitionRoot>
          </HeadlessTabPanel>
          <HeadlessTabPanel
            v-slot="{ selected }"
            as="template"
            :unmount="false"
          >
            <HeadlessTransitionRoot
              appear
              :show="selected"
              enter="tab-enter"
              enter-to="tab-enter-to"
              enter-from="tab-enter-from"
              :unmount="false"
              ><EventResults :event="event" />
            </HeadlessTransitionRoot>
          </HeadlessTabPanel>
          <HeadlessTabPanel
            v-slot="{ selected }"
            as="template"
            :unmount="false"
          >
            <HeadlessTransitionRoot
              appear
              :show="selected"
              enter="tab-enter"
              enter-to="tab-enter-to"
              enter-from="tab-enter-from"
              :unmount="false"
            >
              <EventPredictions :event="event" />
            </HeadlessTransitionRoot>
          </HeadlessTabPanel>
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
  if (event.value.predictionsCloseDate === null) return false
  return event.value.predictionsCloseDate > new Date()
})

//check if there are any results
const hasResults = computed(() => {
  let hasResults = false
  event.value.sections.forEach((section) => {
    section.questions.forEach((question) => {
      const result = useGetResult(question)
      if (result !== null && result !== "") {
        hasResults = true
      }
    })
  })
  return hasResults
})

const hasInformation = computed(() => {
  if (event.value.information === null) return false
  if (event.value.information === "") return false
  if (event.value.information !== "<p></p>") {
    return true
  }
  return false
})

useHead({
  title: event.value.name ?? "",
})

const tabs = ref([
  { name: "Information", disabled: !hasInformation.value },
  { name: "Points", disabled: !hasResults.value },
  { name: "Results", disabled: !hasResults.value },
  {
    name: "Predictions",
    disabled:
      !userEntered.value || (!userEntered.value && !predicionsOpen.value),
  },
])
</script>

<style scoped>
.tab-enter {
  transition: all 0.5s ease-in;
}

.tab-enter-from {
  opacity: 0;
}
.tab-enter-to {
  opacity: 1;
}
</style>
