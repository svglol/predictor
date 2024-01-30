<template>
  <UCard
    :ui="{
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      body: { padding: '!p-0' },
    }">
    <template #header>
      <h2
        class="flex flex-row justify-between text-xl font-bold text-gray-700 dark:text-gray-300">
        {{ year }}
        Standings
        <USelect v-model="year" size="xs" :options="years" />
      </h2>
    </template>
    <UTable
      :rows="standings"
      :columns="standingsColumns"
      :loading="pending"
      :ui="{
        base: 'w-full',
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
          <UAvatar :src="row.user.image + '?size=32'" :alt="row.user.name" />
          <span class="truncate font-semibold">{{ row.user.name }}</span>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script lang="ts" setup>
const { $client } = useNuxtApp()
const { pending, data: users } =
  await $client.events.getEntriesForStandings.useQuery()

const { events } = definePropsRefs<{
  events: EventCard[]
}>()

const years: Ref<string[]> = ref([])
if (events.value) {
  years.value.push('All Time')
  events.value.forEach(event => {
    if (
      event.endDate &&
      !years.value.includes(String(event.endDate.getFullYear())) &&
      event.endDate < new Date()
    ) {
      years.value.push(String(event.endDate.getFullYear()))
    }
  })
}

const year = ref(years.value[0])

const standings = computed(() => {
  let standings: { user: User; score: number }[] = []
  users.value?.forEach(user => {
    let score = 0
    user.entries.forEach(entry => {
      if (entry.event.endDate && entry.event.endDate < new Date()) {
        if (
          year.value !== 'All Time' &&
          entry.event.endDate.getFullYear() === Number(year.value)
        ) {
          score += calculatePointsForRank(entry.rank)
        } else if (year.value === 'All Time') {
          score += calculatePointsForRank(entry.rank)
        }
      }
    })
    standings.push({ user: user, score: score })
  })
  standings.sort((a, b) => b.score - a.score)
  standings = standings.filter(a => a.score > 0)
  standings = standings.slice(0, 10)

  return standings
})
const standingsColumns = [
  {
    key: 'position',
    label: 'Position',
    class: '!w-24',
  },
  {
    key: 'user',
    label: 'User',
    class: 'sm:!w-auto !w-full',
  },
  {
    key: 'score',
    label: 'Score',
    class: '!w-24',
  },
]

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
  if (
    year.value === 'All Time' ||
    year.value === String(new Date().getFullYear())
  ) {
    return ''
  }

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
