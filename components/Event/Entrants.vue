<template>
  <div v-if="entries.length > 0" class="grid grid-cols-3 gap-6">
    <NuxtLink
      v-for="(person, index) in entries"
      :key="index"
      :to="`/user/${person.name}`"
      class="flex basis-24 flex-col items-center gap-1 truncate hover:opacity-80 sm:basis-44"
    >
      <UAvatar
        :src="img(person.picture, { height: 64, width: 64 })"
        :alt="person.name"
        size="2xl"
        class="m-1"
      />
      <span class="w-full truncate text-center text-sm font-bold sm:text-base">
        {{ person.name }}
      </span>
    </NuxtLink>
  </div>
  <div v-else class="w-full py-2 text-center">
    <span class="font-semibold">No Entrants Yet!</span>
  </div>
</template>

<script setup lang="ts">
const img = useImage()
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const entries = computed(() => {
  if (!event.value)
    return []
  const entries = event.value.entries
    .map((entry) => {
      return {
        name: entry.user.name ?? '',
        picture: entry.user.image ?? '',
        createdAt: entry.createdAt,
      }
    })
    .sort((a, b) => a.createdAt - b.createdAt)
  return entries
})
</script>
