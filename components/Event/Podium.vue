<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-center gap-4">
      <NuxtLink
        v-for="(person, index) in podiumData.slice(0, 3)"
        :key="index"
        :to="`/user/${person.name}`"
        :class="getRankPodiumClass(person.rank)"
        class="flex basis-24 flex-col items-center gap-1 truncate hover:opacity-80 sm:basis-44">
        <span :class="getRankClass(person.rank)" class="mb-1 font-bold">
          {{ useGetOrdinalSuffix(person.rank) }}
        </span>
        <UAvatar :src="person.picture" :alt="person.name" size="3xl" />
        <span class="w-full truncate text-center text-sm font-bold sm:text-lg">
          {{ person.name }}
        </span>
        <span class="text-3xl">{{ getMedalEmoji(person.rank) }}</span>
      </NuxtLink>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <NuxtLink
        v-for="(person, index) in podiumData.slice(3)"
        :key="index"
        :to="`/user/${person.name}`"
        class="flex basis-16 flex-col items-center gap-1 hover:opacity-80">
        <span class="mb-1 text-sm font-bold">
          {{ useGetOrdinalSuffix(person.rank) }}
        </span>
        <UAvatar :src="person.picture" :alt="person.name" size="lg" />
        <span class="w-full truncate text-center text-sm font-bold">
          {{ person.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const podiumData = computed(() => {
  if (!event.value) return []
  const entries = event.value.entries.map(entry => {
    return {
      name: entry.user.name ?? '',
      picture: entry.user.image ?? '',
      rank: entry.rank,
    }
  })
  entries.splice(1, 0, entries.shift()!)
  return entries
})

const getRankClass = (index: number) => {
  const rankClasses = ['text-yellow-500', 'text-gray-400', 'text-amber-600']
  return rankClasses[index - 1] || ''
}

const getRankPodiumClass = (index: number) => {
  const rankClasses = ['mt-0', 'mt-8', 'mt-8']
  return rankClasses[index - 1] || ''
}

const getMedalEmoji = (index: number) => {
  switch (index) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return '🏆'
  }
}
</script>
