<template>
  <div class="flex flex-col">
    <AdminEventHeader :title="event?.name">
      <UButton icon="i-heroicons-plus" :disabled="disabled" @click="addSection">
        Add Section
      </UButton>
      <UButton
        :loading="saving"
        icon="material-symbols:save"
        :disabled="!saveEnabled || !valid"
        @click="saveEvent">
        Save
      </UButton>
      <template #badges>
        <UBadge variant="subtle">Questions: {{ totalQuestions }}</UBadge>
        <UBadge variant="subtle">Points: {{ totalPoints }}</UBadge>
      </template>
    </AdminEventHeader>
    <div class="flex flex-col gap-2 p-4">
      <div class="flex flex-col">
        <SlickList v-model:list="sections" axis="y" :use-drag-handle="true">
          <SlickItem
            v-for="(section, i) in sections"
            :key="section.id"
            :index="i"
            class="">
            <AdminEventEditSection
              :section="section"
              :option-sets="optionSets"
              :disabled="disabled"
              @delete-section="deleteSection" />
          </SlickItem>
        </SlickList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ModalSave } from '#components'

definePageMeta({
  middleware: ['admin'],
  layout: 'admin',
  validate: route => {
    return /^\d+$/.test(String(route.params.id))
  },
  pageTransition: false,
})

const toast = useToast()
const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.eventsAdmin.getEvent.useQuery(Number(id))
const { data: optionSets } =
  await $client.eventsAdmin.getOptionSetsForEvent.useQuery({
    eventId: Number(id),
  })
useHead({
  title: event.value?.name ?? 'New Event' + ' - Form',
})

const sections = ref(event.value?.sections ?? [])
const saving = ref(false)
const valid = ref(true)
const saveEnabled = ref(false)
const disabled = computed(() => {
  if (
    event.value?.status === 'FINISHED' ||
    event.value?.status === 'PUBLISHED'
  ) {
    return true
  }
  return false
})

// eslint-disable-next-line camelcase
const { ctrl_s } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 's' && e.type === 'keydown') e.preventDefault()
  },
})

whenever(ctrl_s, () => {
  if (saveEnabled.value) saveEvent()
})

const handler = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}
watchEffect(() => {
  if (saveEnabled.value) {
    window.addEventListener('beforeunload', handler)
  }
})

watchDeep(sections, () => {
  sections.value.forEach((section, i) => {
    section.order = i
  })
})

const modal = useModal()
onBeforeRouteLeave((_to, _from, next) => {
  if (saveEnabled.value) {
    modal.open(ModalSave, {
      text: 'You have unsaved changes!',
      close: () => {
        window.removeEventListener('beforeunload', handler)
        modal.close()
        next()
      },
      save: async () => {
        await saveEvent()
        modal.close()
        next()
      },
      icon: 'carbon:warning',
    })
  } else {
    window.removeEventListener('beforeunload', handler)
    next()
  }
})

watchDeep([sections], () => {
  saveEnabled.value = true
})

async function addSection() {
  const section = await $client.eventsAdmin.addSection.mutate({
    eventId: Number(id),
    order: sections.value.length ?? 0,
  })
  if (section) {
    sections.value.push(section)
  }
}

async function deleteSection(sectionId: number) {
  const mutate = await $client.eventsAdmin.deleteSection.mutate(sectionId)
  if (mutate && event.value) {
    sections.value = sections.value.filter(section => section.id !== sectionId)
  }
}

async function saveEvent() {
  if (valid.value) {
    saving.value = true

    const mutate =
      await $client.eventsAdmin.updateEventSectionsQuestions.mutate({
        id: Number(id),
        sections: sections.value.map(section => {
          return {
            id: section.id,
            heading: section.heading ?? '',
            description: section.description ?? '',
            order: section.order ?? 0,
            questions: section.questions.map(question => {
              return {
                id: question.id,
                question: question.question ?? '',
                hint: question.hint ?? '',
                type: question.type ?? 'TEXT',
                optionSetId: question.optionSetId,
                order: question.order ?? 0,
                points: Number(question.points),
              }
            }),
          }
        }),
      })

    if (mutate) {
      await $client.eventsAdmin.updateScores.mutate(event.value?.id ?? 0)
      saving.value = false
      saveEnabled.value = false
      toast.add({ title: 'Event Saved Successfully!' })
      window.removeEventListener('beforeunload', handler)
    }
  }
}

const totalPoints = computed(() => {
  return sections.value
    .flatMap(section => section.questions)
    .map(question => question.points)
    .reduce((a, b) => a + b, 0)
})
const totalQuestions = computed(() => {
  return sections.value
    .map(section => section.questions.length)
    .reduce((a, b) => a + b)
})
</script>
