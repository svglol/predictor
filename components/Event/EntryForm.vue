<template>
  <div class="flex flex-col gap-6">
    <UAlert
      v-if="alreadySubmitted"
      :title="
        justSubmitted
          ? 'Your entry has been submitted! If you want to update it you can do so until predictions close.'
          : 'You have already entered, but you can update your entry!'
      "
      icon="i-heroicons-exclamation-circle"
      color="primary"
      variant="subtle" />
    <div>
      <Transition :name="transition" mode="out-in">
        <div :key="section">
          <FormSection
            :section="currentSection as Section"
            :form-section="currentFormSection" />
        </div>
      </Transition>
    </div>
    <div class="flex max-w-full flex-row justify-between">
      <UButton
        icon="i-heroicons-chevron-left-20-solid"
        :trailing="false"
        class="mr-2"
        @click="prev">
        Previous
      </UButton>
      <div
        v-if="event?.sections"
        class="hidden flex-row items-center space-x-1 self-center sm:space-x-2 md:flex">
        <template v-for="i in event?.sections.length" :key="i">
          <Transition name="color" mode="out-in">
            <div
              :key="section"
              class="h-2 w-2 rounded-full"
              :class="
                i === section + 1
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              "></div>
          </Transition>
        </template>
      </div>
      <span v-if="event?.sections" class="flex items-center text-xs md:hidden">
        {{ section + 1 }} / {{ event?.sections.length }}
      </span>
      <div class="flex w-20">
        <Transition name="fade" mode="out-in">
          <UButton
            v-if="showSubmit"
            :loading="submitting"
            class="ml-auto"
            @click="submit">
            {{ alreadySubmitted ? 'Update' : 'Submit' }}
          </UButton>

          <UButton
            v-else-if="!showSubmit"
            class="ml-auto"
            icon="i-heroicons-chevron-right-20-solid"
            :trailing="true"
            @click="next">
            Next
          </UButton>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { session: user } = useAuth()
const { $client } = useNuxtApp()
const toast = useToast()

const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const entry = computed(() => {
  return (
    event.value?.entries.find(
      entry => entry.user.id === user.value?.user?.id
    ) ?? null
  )
})

const emits = defineEmits(['update'])

const alreadySubmitted = computed(() => {
  if (entry.value) return true
  return false
})

const justSubmitted = ref(false)

// create formresponse
const formSections: FormSection[] = []

const formResponse: Ref<FormResponse> = useState(
  `formResponse-${event.value?.id}`,
  () => {
    return {
      eventId: event.value?.id ?? 0,
      userId: user.value?.user?.id ?? '',
      entrySections: formSections,
    }
  }
)

if (formResponse.value.entrySections.length === 0) {
  makeFormSecions()
}

watchDeep(entry, () => {
  makeFormSecions()
})

function makeFormSecions() {
  formSections.length = 0
  event.value?.sections.forEach(section => {
    const entrySection = entry?.value?.entrySections.find(
      entrySection => entrySection.sectionId === section.id
    )
    const formQuestions: FormQuestion[] = []
    section.questions.forEach(question => {
      const entryQuestion = entrySection?.entryQuestions.find(
        entryQuestion => entryQuestion.questionId === question.id
      )
      formQuestions.push({
        id: question.id,
        entryQuestionId: entryQuestion?.id ?? 0,
        question: question.question,
        valid: '',
        sectionId: section.id,
        answerString: entryQuestion?.entryString ?? undefined,
        answerBoolean: entryQuestion?.entryBoolean ?? undefined,
        answerNumber: entryQuestion?.entryNumber ?? undefined,
        answerOption: entryQuestion?.entryOptionId ?? undefined,
      } as FormQuestion)
    })
    formSections.push({
      id: section.id,
      entryQuestions: formQuestions,
    })
  })
  if (justSubmitted.value) {
    formResponse.value.entrySections = formSections
    currentFormSection.value = formResponse.value.entrySections[section.value]
  }
}

const transition = ref('slide-right')
const section = useState(`section-${event.value?.id}`, () => 0)
const currentSection = ref(event.value?.sections[section.value] ?? null)
const currentFormSection = ref(formResponse.value.entrySections[section.value])
const submitting = ref(false)

watch(section, (newSection, oldSection) => {
  if (event.value) currentSection.value = event.value.sections[section.value]
  currentFormSection.value = formResponse.value.entrySections[section.value]

  if (newSection !== oldSection) {
    if (newSection > oldSection) {
      transition.value = 'slide-right'
    }
    if (newSection < oldSection) {
      transition.value = 'slide-left'
    }
  }
})

function validateForm() {
  currentFormSection.value.entryQuestions.forEach(formQuestion => {
    const question = currentSection.value?.questions.find(
      q => q.id === formQuestion.id
    ) as Question
    formQuestion.valid = ''
    if (question.type === 'TEXT' && formQuestion.answerString === '') {
      formQuestion.valid = 'This field is required'
    } else if (question.type === 'NUMBER' && !formQuestion.answerNumber) {
      formQuestion.valid = 'This field is required'
    } else if (
      question.type === 'TIME' &&
      !/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/.test(
        formQuestion.answerString as string
      )
    ) {
      formQuestion.valid = 'Not a valid time - must be hh:mm:ss'
    } else if (question.type === 'MULTI' && !formQuestion.answerOption) {
      formQuestion.valid = 'This field is required'
    }
  })
  return (
    currentFormSection.value.entryQuestions.filter(
      question => question.valid !== ''
    ).length === 0
  )
}

function next() {
  if (section.value < (event.value?.sections.length || 0)) {
    if (validateForm()) section.value++
  }
}

function prev() {
  if (section.value > 0) section.value--
}

const original = computed(() => {
  return (
    entry.value?.entrySections
      .map(obj => obj.entryQuestions)
      .flat()
      .map(question => {
        return {
          id: question.id,
          entryBoolean: question.entryBoolean,
          entryNumber: question.entryNumber,
          entryOptionId: question.entryOptionId,
          entryString: question.entryString,
        }
      }) ?? []
  )
})

const updated = computed(() => {
  return formResponse.value.entrySections
    .map(obj => obj.entryQuestions)
    .flat()
    .map(question => {
      return {
        id: question.entryQuestionId,
        eventEntrySectionId: question.sectionId,
        entryBoolean: question.answerBoolean,
        entryNumber: question.answerNumber,
        entryOptionId: question.answerOption,
        entryString: question.answerString,
      }
    })
})

const difference = computed(() => {
  return updated.value.filter(x => {
    const orig = original.value.find(y => y.id === x.id)
    return (
      x.entryString !== (orig?.entryString ?? undefined) ||
      x.entryBoolean !== (orig?.entryBoolean ?? undefined) ||
      x.entryNumber !== (orig?.entryNumber ?? undefined) ||
      x.entryOptionId !== (orig?.entryOptionId ?? undefined)
    )
  })
})

async function submit() {
  if (validateForm() && event.value) {
    if (alreadySubmitted.value && difference.value.length > 0) {
      submitting.value = true
      const eventEntry = await $client.events.updateEventEntry.mutate({
        id: entry.value?.id ?? 0,
        eventId: event.value.id,
        updatedQuestions: difference.value.map(question => ({
          id: question.id ?? 0,
          eventEntrySectionId: question.eventEntrySectionId,
          entryBoolean: question.entryBoolean,
          entryNumber: question.entryNumber,
          entryOptionId: question.entryOptionId,
          entryString: question.entryString,
        })),
      })
      if (eventEntry) {
        justSubmitted.value = false
        entryUpdated()
      }
    } else if (!alreadySubmitted.value) {
      // create entry
      submitting.value = true
      const eventEntry = await $client.events.addEventEntry.mutate({
        eventId: event.value.id,
        entrySections: formResponse.value.entrySections.map(section => ({
          sectionId: section.id,
          entryQuestions: section.entryQuestions.map(question => ({
            eventEntrySectionId: question.sectionId,
            questionId: question.id,
            entryString: question.answerString,
            entryBoolean: question.answerBoolean,
            entryNumber: question.answerNumber,
            entryOptionId: question.answerOption,
          })),
        })),
      })

      if (eventEntry) {
        justSubmitted.value = true
        entryUpdated()
      }
    }
  }
}

async function entryUpdated() {
  await $client.webhook.sendMessage.mutate({
    title: event.value?.name ?? '',
    description: `## 📝 ***${alreadySubmitted.value ? 'Updated' : 'New'} entry from ${user.value?.user?.name}***`,
    url: `${useRuntimeConfig().public.authJs.baseUrl}/${event.value?.slug}`,
    thumbnail: user.value?.user.image ?? '',
  })
  submitting.value = false
  submitted.value = true
  emits('update')
  toast.add({
    title: alreadySubmitted.value ? 'Entry Updated' : 'Entry Submitted',
    color: 'primary',
  })
}

const showSubmit = computed(() => {
  if (!event.value) return false
  else if (event.value?.sections.length - 1 === section.value) return true
  else return false
})

const submitted = ref(false)
</script>

<style scoped>
.slide-left-enter-active,
.slide-right-enter-active {
  transition: all 0.4s ease-out;
}

.slide-left-leave-active,
.slide-right-leave-active {
  transition: all 0.4s ease-in;
}

.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.color-enter-active {
  transition: background-color 0.4s ease-out;
}

.color-leave-active {
  transition: background-color 0.4s ease-in;
}

.color-enter-from {
  @apply bg-gray-300 dark:bg-gray-700;
}

.color-leave-to {
  @apply bg-gray-300 dark:bg-gray-700;
}
</style>
