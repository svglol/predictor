<script setup lang="ts">
definePageMeta({
  validate: async route => {
    return /^[a-zA-Z0-9\b]{5}$/.test(String(route.params.id))
  },
})
const route = useRoute()
const { $client } = useNuxtApp()
const { data: event, error } = await $client.events.getEventWithInvite.useQuery(
  String(route.params.id)
)
const eventId = computed(() => {
  return event.value?.id ?? 0
})

if (error.value !== null || !event.value || !event.value.visible)
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })

if (eventId) {
  navigateTo(`/event/${eventId.value}`)
}
</script>
