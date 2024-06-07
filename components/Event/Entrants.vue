<template>
  <div v-if="entries.length > 0" class="grid grid-cols-2 gap-6 sm:grid-cols-4">
    <NuxtLink
      v-for="(person, index) in entries"
      :key="index"
      :to="`/user/${person.name}`"
      class="flex basis-24 flex-col items-center gap-2 hover:opacity-80 sm:basis-44"
    >
      <span class="w-full text-center text-sm font-bold text-black sm:text-base dark:text-white">
        {{ person.entrantName ?? person.name }}
      </span>

      <NuxtImg v-if="person.entrantImage !== ''" class="size-24 object-cover sm:size-44" :src="person.entrantImage" provider="cloudinary" placeholder height="400" width="400" fit="cover" />
      <NuxtImg v-else class="size-24 object-cover sm:size-44" :src="person.picture" />
      <span v-if="person.entrantQuote" class="block w-full text-center text-sm font-bold sm:text-sm">{{ person.entrantQuote }}</span>
    </NuxtLink>
  </div>
  <div v-else class="w-full py-2 text-center">
    <span class="font-semibold">No Entrants Yet!</span>
  </div>
</template>

<script setup lang="ts">
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
        entrantName: entry.entrantName,
        entrantImage: entry.entrantImage ?? '',
        entrantQuote: entry.entrantQuote,
        picture: entry.user.image ?? '',
        createdAt: entry.createdAt,
      }
    })
    .sort((a, b) => a.createdAt.getUTCDate() - b.createdAt.getUTCDate())
  return entries
})
</script>
