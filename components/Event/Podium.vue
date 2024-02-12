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
        <UAvatar
          :src="img(person.picture, { height: 80, width: 80 })"
          :alt="person.name"
          size="3xl" />
        <span class="w-full truncate text-center text-sm font-bold sm:text-lg">
          {{ person.name }}
        </span>
        <span class="text-3xl">
          <UIcon :name="getMedalIcon(person.rank)" />
        </span>
      </NuxtLink>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <NuxtLink
        v-for="(person, index) in podiumData.slice(3)"
        :key="index"
        :to="`/user/${person.name}`"
        class="flex w-20 max-w-20 grow basis-20 flex-col items-center gap-1 hover:opacity-80">
        <span class="mb-1 text-sm font-bold">
          {{ useGetOrdinalSuffix(person.rank) }}
        </span>
        <UAvatar
          :src="img(person.picture, { height: 48, width: 48 })"
          :alt="person.name"
          size="lg" />
        <span class="w-full truncate text-center text-sm font-bold">
          {{ person.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const img = useImage()
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

const getRankPodiumClass = (index: number) => {
  const rankClasses = ['mt-0', 'mt-8', 'mt-8']
  return rankClasses[index - 1] || ''
}
</script>
