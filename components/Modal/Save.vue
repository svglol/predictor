<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-row items-center justify-between gap-2">
        <div class="flex flex-row items-center gap-2 text-red-500">
          <UIcon v-if="icon" :name="icon" />
          <span class="font-bold">{{ text }}</span>
        </div>
        <div class="flex flex-row gap-2">
          <UButton
            size="sm"
            variant="outline"
            :disabled="saving"
            @click="close">
            Discard
          </UButton>
          <UButton
            size="sm"
            variant="solid"
            :loading="saving"
            @click="saveModal">
            Save
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  text: string
  icon?: string
  save: () => Promise<void>
  close: () => void
}>()

const saving = ref(false)

async function saveModal() {
  saving.value = true
  await props.save?.()
  props.close()
  saving.value = false
}
</script>
