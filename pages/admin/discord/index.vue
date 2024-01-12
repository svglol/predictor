<template>
  <div>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col space-y-2">
        <!-- Content -->
        <h2 class="text-xl">Send Discord Message</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300"></p>
        <UFormGroup label="Post">
          <UTextarea v-model="value" autoresize />
        </UFormGroup>
      </div>
      <template #footer>
        <!-- Content -->
        <div class="flex flex-row-reverse">
          <UButton
            icon="i-heroicons-pencil-square"
            color="green"
            class="self-end"
            @click="send">
            Send Message
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin-only'],
  layout: 'admin',
})

const value = ref('')

const send = async () => {
  await useFetch('/api/webhook', {
    method: 'post',
    body: {
      content: value.value,
    },
  })
  value.value = ''
}
</script>
