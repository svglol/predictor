<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="flex w-full place-content-center justify-center">
    <UCard
      v-if="predictionsOpen && !alreadySubmitted && !submitted"
      class="h-min w-full"
    >
      <template #header>
        <EventHeader :event="event" />
      </template>
      <transition name="fade" mode="out-in">
        <div :key="section">
          <div
            v-if="section === 0 && hasInformation"
            class="prose max-w-full dark:prose-invert focus:outline-none"
            v-html="event?.information ?? ''"
          />
          <FormSection
            v-if="section !== 0 || !hasInformation"
            :section="currentSection"
            :form-section="currentFormSection"
            @update-section="updateSection"
          />
        </div>
      </transition>
      <template #footer>
        <div class="flex flex-row justify-between">
          <UButton
            icon="i-heroicons-chevron-left-20-solid"
            :trailing="false"
            @click="prev"
            >Previous</UButton
          >
          <div
            v-if="event?.sections"
            class="flex flex-row items-center space-x-2"
          >
            <template
              v-for="i in event?.sections.length + indexOffset"
              :key="i"
            >
              <div
                class="h-2 w-2 rounded-full"
                :class="
                  i === section + 1
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                "
              ></div>
            </template>
          </div>
          <UButton v-if="showSubmit" :loading="submitting" @click="submit"
            >Submit</UButton
          >
          <UButton
            v-if="!showSubmit"
            icon="i-heroicons-chevron-right-20-solid"
            :trailing="true"
            @click="next"
            >Next</UButton
          >
        </div>
      </template>
    </UCard>
    <div
      v-if="alreadySubmitted || !predictionsOpen || submitted"
      class="flex flex-col items-center justify-center space-y-2"
    >
      <span class="p-4 text-2xl font-light text-black dark:text-white">
        <template v-if="alreadySubmitted">
          You have already submitted a prediction for this event!</template
        >
        <template v-if="!predictionsOpen && !alreadySubmitted">
          Predictions are closed!</template
        >
        <template v-if="submitted">
          Your prediction has been submitted!</template
        >
      </span>
      <div v-if="alreadySubmitted || submitted">
        <UButton :to="`/event/${eventId}`" size="xl">Go to event page</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  validate: async (route) => {
    return /^[a-zA-Z0-9\b]{5}$/.test(String(route.params.id))
  },
})
const route = useRoute()
const { session: user } = useAuth()
const { $client, $bus } = useNuxtApp()
const { data: event, error } = await $client.events.getEventWithInvite.useQuery(
  String(route.params.id)
)

const { data: userEntries } = await $client.users.getUserEntries.useQuery(
  Number(user.value?.user?.id)
)

const eventId = computed(() => {
  return event.value?.id ?? 0
})

const eventName = computed(() => {
  return event.value?.name ?? ""
})

if (error.value !== null || !event.value || !event.value.visible)
  throw createError({ statusCode: 404, statusMessage: "Page Not Found" })

const now = new Date()
const predictionsOpen = ref(
  (event.value.predictions_close_date ?? new Date()) > now
)

useHead({
  title: eventName.value ?? "",
})

const hasInformation = computed(() => {
  if (event.value) {
    if (event.value.information === "" || event.value.information === null)
      return false
    if (event.value.information !== "<p></p>") {
      return true
    }
  }
  return false
})

const indexOffset = computed(() => {
  if (hasInformation.value) return 1
  return 0
})

// create formresponse
let formSections: FormSection[] = []
event.value?.sections.forEach((section) => {
  let formQuestions: FormQuestion[] = []
  section.questions.forEach((question) => {
    formQuestions.push({
      id: question.id,
      question: question.question,
      valid: false,
      sectionId: section.id,
    } as FormQuestion)
  })
  formSections.push({
    id: section.id,
    entryQuestions: formQuestions,
  })
})

let formResponse: FormResponse = {
  eventId: event.value?.id,
  userId: Number(user.value?.user?.id),
  entrySections: formSections,
}

const section = ref(0)
const currentSection = ref(
  event.value.sections[section.value - indexOffset.value]
)
const currentFormSection = ref(
  formResponse.entrySections[section.value - indexOffset.value]
)
const submitting = ref(false)

watch(section, () => {
  if (event.value)
    currentSection.value =
      event.value.sections[section.value - indexOffset.value]
  currentFormSection.value =
    formResponse.entrySections[section.value - indexOffset.value]
})

function updateSection(formSection: FormSection) {
  const sectionIndex = formResponse.entrySections.findIndex(
    (section) => section.id === formSection.id
  )
  formResponse.entrySections[sectionIndex] = formSection
  currentFormSection.value = formSection
}

function checkValid() {
  return (
    currentFormSection.value.entryQuestions.filter(
      (question) => question.valid === false
    ).length === 0
  )
}

function next() {
  if (section.value === 0 && hasInformation.value) section.value++
  else if (section.value < (event.value?.sections.length || 0)) {
    $bus.$emit("checkValidation", {})
    if (checkValid()) section.value++
    else {
      $bus.$emit("checkValidation", {})
    }
  }
}

function prev() {
  if (section.value > 0) section.value--
}

async function submit() {
  if (!checkValid()) {
    $bus.$emit("checkValidation", {})
  } else if (!alreadySubmitted.value && event.value) {
    submitting.value = true

    //create entry
    const eventEntry = await $client.events.addEventEntry.mutate({
      eventId: event.value.id,
      entrySections: formResponse.entrySections.map((section) => ({
        sectionId: section.id,
      })),
    })

    let questions: {
      eventEntrySectionId: number
      questionId: number
      entryString?: string
      entryBoolean?: boolean
      entryNumber?: number
      entryOptionId?: number
    }[] = []
    if (eventEntry) {
      eventEntry.entrySections.forEach(async (section) => {
        let entrySection = formResponse.entrySections.find(
          (formSection) => formSection.id === section.sectionId
        )

        if (entrySection) {
          let entryQuestions = entrySection.entryQuestions.map((question) => ({
            eventEntrySectionId: section.id,
            questionId: question.id,
            entryString: question.answerString,
            entryBoolean: question.answerBoolean,
            entryNumber: question.answerNumber,
            entryOptionId: question.answerOption,
          }))
          questions = questions.concat(entryQuestions)
        }
      })
    }
    //create questions
    const eventQuestions =
      await $client.events.addManyEventEntryQuestions.mutate(questions)

    if (eventEntry && eventQuestions) {
      submitting.value = false
      submitted.value = true
    }
  }
}

const alreadySubmitted = computed(() => {
  let alreadySubmitted = false
  userEntries.value.entries.forEach((entry) => {
    if (entry.eventId === event.value?.id) {
      alreadySubmitted = true
    }
  })
  return alreadySubmitted
})
const showSubmit = computed(() => {
  if (!event.value) return false
  if (hasInformation.value)
    if (event.value?.sections.length == section.value) return true
    else return false
  else if (event.value?.sections.length - 1 == section.value) return true
  else return false
})

const submitted = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
