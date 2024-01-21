<template>
  <UCard
    :ui="{
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      body: { padding: '!p-0' },
    }">
    <template #header>
      <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300">
        {{ type === 'currentyear' ? new Date().getFullYear() : 'All Time' }}
        Standings
      </h2>
    </template>
    <UTable
      :rows="standings"
      :columns="standingsColumns"
      :loading="pending"
      :ui="{
        th: { padding: '!px-4 sm:!px-6' },
        td: { padding: '!px-4 sm:!px-6' },
      }">
      <template #position-data="{ row }">
        <div class="flex items-center">
          <span class="text-2xl">
            {{ getEmoji(standings.indexOf(row) + 1) }}
          </span>
          {{ useGetOrdinalSuffix(standings.indexOf(row) + 1) }}
        </div>
      </template>
      <template #user-data="{ row }">
        <div class="flex flex-row items-center space-x-2">
          <UAvatar :src="row.user.image" :alt="row.user.name" />
          <span class="font-semibold">{{ row.user.name }}</span>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script lang="ts" setup>
import type { User } from '@prisma/client'

const { type } = definePropsRefs<{
  type: 'alltime' | 'currentyear'
}>()

const { $client } = useNuxtApp()
const { pending, data: users } =
  await $client.events.getEntriesForStandings.useQuery()

const standingsColumns = [
  {
    key: 'position',
    label: 'Position',
  },
  {
    key: 'user',
    label: 'User',
  },
  {
    key: 'score',
    label: 'Score',
  },
]

const standings: Ref<{ user: User; score: number }[]> = ref([])
users.value?.forEach(user => {
  let score = 0
  user.entries.forEach(entry => {
    if (entry.event.endDate && entry.event.endDate < new Date()) {
      if (
        type.value === 'currentyear' &&
        entry.event.endDate.getFullYear() === new Date().getFullYear()
      ) {
        score += calculatePointsForRank(entry.rank)
      } else if (type.value === 'alltime') {
        score += calculatePointsForRank(entry.rank)
      }
    }
  })
  standings.value.push({ user: user, score: score })
})
standings.value.sort((a, b) => b.score - a.score)
standings.value = standings.value.filter(a => a.score > 0)
standings.value = standings.value.slice(0, 10)

function calculatePointsForRank(rank: number) {
  switch (rank) {
    case 1:
      return 25
    case 2:
      return 18
    case 3:
      return 15
    case 4:
      return 12
    case 5:
      return 10
    case 6:
      return 8
    case 7:
      return 6
    case 8:
      return 4
    case 9:
      return 2
    case 10:
      return 1
    default:
      return 0
  }
}

function getEmoji(position: number) {
  switch (position) {
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
