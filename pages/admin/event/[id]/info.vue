<template>
  <div>
    <div><Tiptap v-model="content" :saving="saving" @save="save" /></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: "admin-event",
  validate: async (route) => {
    return /^\d+$/.test(String(route.params.id))
  },
})

const route = useRoute()
const id = route.params.id

const { $client } = useNuxtApp()
const { data: event } = await $client.events.getEvent.useQuery(Number(id))

useHead({
  title: event.value?.name ?? "New Event" + " - Information",
})

const content = ref(event.value.information ?? "")
const saving = ref(false)

watchDebounced(
  content,
  () => {
    save()
  },
  { debounce: 500, maxWait: 1000 }
)

async function save() {
  saving.value = true
  const update = await $client.events.updateEventInformation.mutate({
    id: Number(id),
    information: content.value,
  })
  if (update) {
    saving.value = false
  }
}
</script>

<style></style>
