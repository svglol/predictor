<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <div class="flex flex-row gap-4">
      <div
        v-for="(group, index) in podiumData"
        :key="index"
        class="flex basis-24 flex-col items-center gap-2 sm:basis-48"
        :class="getRankPodiumClass(group[0].rank)"
        :to="`/user/${group[0].name}`"
      >
        <span :class="getRankClass(group[0].rank)" class="mb-1 font-bold">
          {{ getOrdinalSuffix(group[0].rank) }}
        </span>
        <UAvatarGroup :max="3" :size="smallerThanLg ? 'xl' : '3xl'">
          <NuxtLink
            v-for="(person, personIndex) in group"
            :key="personIndex"
            class="!ring-0 hover:opacity-80"
            :to="`/user/${person.name}`"
          >
            <UAvatar
              :size="smallerThanLg ? '2xl' : '3xl'"
              :src="img(person.picture, { height: 80, width: 80 })"
              :alt="person.name"
            />
          </NuxtLink>
        </UAvatarGroup>
        <span class="w-full truncate text-center text-sm font-bold sm:text-lg">
          <template v-for="(person, personIndex) in group">
            {{ person.name }}{{ personIndex !== group.length - 1 ? ', ' : '' }}
          </template>
        </span>
        <span class="text-3xl">
          <UIcon :name="getMedalIcon(group[0].rank)" />
        </span>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <NuxtLink
        v-for="(person, index) in nonPodiumEntries"
        :key="index"
        :to="`/user/${person.name}`"
        class="flex w-20 max-w-20 grow basis-20 flex-col items-center gap-1 hover:opacity-80"
      >
        <span class="mb-1 text-sm font-bold">
          {{ getOrdinalSuffix(person.rank) }}
        </span>
        <UAvatar
          :src="img(person.picture, { height: 48, width: 48 })"
          :alt="person.name"
          size="lg"
        />
        <span class="w-full truncate text-center text-sm font-bold">
          {{ person.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'

const img = useImage()
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerThanLg = breakpoints.smaller('lg')

const podiumData = computed(() => {
  if (!event.value)
    return []
  const entries = event.value.entries
    .map(entry => ({
      name: entry.user.name ?? '',
      picture: entry.user.image ?? '',
      rank: entry.rank,
    }))
    .filter(entry => entry.rank <= 3)
    .sort((a, b) => a.rank - b.rank)

  const podiumEntries = []
  let currentRank = 2
  let currentGroup = []
  let firstRankGroup: { name: string, picture: string, rank: any }[] = []

  for (const entry of entries) {
    if (entry.rank !== currentRank) {
      if (currentGroup.length > 0) {
        if (currentRank === 1)
          firstRankGroup = [...currentGroup]
        else
          podiumEntries.push([...currentGroup])
      }
      currentGroup = []
      currentRank = entry.rank
    }
    currentGroup.push(entry)
  }

  if (currentGroup.length > 0) {
    if (currentRank === 1)
      firstRankGroup = [...currentGroup]
    else
      podiumEntries.push([...currentGroup])
  }

  podiumEntries.splice(1, 0, firstRankGroup)

  return podiumEntries
})

const nonPodiumEntries = computed(() => {
  if (!event.value)
    return []
  return event.value.entries
    .map(entry => ({
      name: entry.user.name ?? '',
      picture: entry.user.image ?? '',
      rank: entry.rank,
    }))
    .filter(entry => entry.rank > 3)
    .sort((a, b) => a.rank - b.rank)
})

function getRankPodiumClass(index: number) {
  const rankClasses = ['mt-0', 'mt-8', 'mt-8']
  return rankClasses[index - 1] || ''
}
</script>
