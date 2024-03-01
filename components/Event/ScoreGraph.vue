<template>
  <ClientOnly>
    <apexchart
      :key="series"
      height="400"
      width="100%"
      :options="options"
      :series="series"></apexchart>
    <template #fallback><div class="h-[400px] w-full" /></template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { event } = definePropsRefs<{
  event: PredictorEvent | null
}>()

const data = computed(() => {
  return (
    event.value?.entries.map(entry => {
      // Initialize total score for each entry
      let questionCount = 1
      let totalScore = 0

      // // Calculate total score for the entry
      const scores = entry.entrySections.flatMap(section => {
        return section.entryQuestions.flatMap(question => {
          // Accumulate the score for each question
          totalScore += question.questionScore
          questionCount++
          return {
            date: questionCount,
            score: totalScore,
          }
        })
      })
      scores.unshift({ date: 0, score: 0 })
      return {
        name: entry.user.name ?? '',
        image: entry.user.image ?? '',
        scores,
      }
    }) || []
  )
})

const series = computed(() => {
  return data.value?.map(user => {
    return {
      name: user.name,
      data: user.scores.map(score => {
        return [score.date, score.score]
      }),
    }
  })
})

const options = computed(() => {
  return {
    chart: {
      height: 400,
      background: 'transparent',
      type: 'area',
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 50,
        },
      },
    },
    colors: [
      '#3b82f6',
      '#f97316',
      '#84cc16',
      '#14b8a6',
      '#f43f5e',
      '#d946ef',
      '#6366f1',
      '#0ea5e9',
      '#ec4899',
      '#eab308',
      '#10b981',
      '#a855f7',
      '#22c55e',
      '#f59e0b',
      '#06b6d4',
      '#8b5cf6',
      '#ef4444',
    ],
    legend: {
      show: true,
      labels: {
        colors: `${colorMode.value === 'dark' ? 'white' : 'black'}`,
      },
      fontSize: '13px',
      fontFamily: 'Exo, ui-sans-serif',
      fontWeight: 400,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    grid: {
      show: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
        type: 'vertical',
        opacityFrom: 0.5,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      type: 'numeric',
      tickPlacement: 'on',
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      crosshairs: {
        show: false,
        stroke: {
          dashArray: 0,
        },
        dropShadow: {
          show: false,
        },
      },
      tooltip: {
        enabled: false,
      },
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      theme: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
      x: {
        show: false,
        format: 'hh:mm dd MMM yyyy',
      },
    },
    responsive: [
      {
        breakpoint: 568,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    theme: {
      mode: `${colorMode.value === 'dark' ? 'dark' : 'light'}`,
    },
  }
})
</script>
