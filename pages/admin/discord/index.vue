<template>
  <div>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col space-y-2">
        <!-- Content -->
        <h2 class="text-xl">Send Discord Message</h2>
        <p class="text-sm text-gray-700 dark:text-gray-300"></p>
        <UFormGroup label="Message">
          <UTextarea v-model="content" autoresize />
        </UFormGroup>

        <UFormGroup label="Embed Title">
          <UInput v-model="title" />
        </UFormGroup>
        <UFormGroup label="Embed Description">
          <UTextarea v-model="description" autoresize />
        </UFormGroup>
        <UFormGroup label="Embed Image URL">
          <UInput v-model="imageUrl" />
        </UFormGroup>
        <UFormGroup label="Embed URL">
          <UInput v-model="url" />
        </UFormGroup>
      </div>
      <template #footer>
        <!-- Content -->
        <div class="flex flex-row-reverse">
          <UButton
            icon="material-symbols:send"
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
const { $client } = useNuxtApp()
definePageMeta({
  middleware: ['admin-only'],
  layout: 'admin',
})

const content = ref('')
const title = ref('')
const description = ref('')
const imageUrl = ref('')
const url = ref('')

const send = async () => {
  await $client.webhook.sendMessage.mutate({
    content: content.value,
    title: title.value,
    description: description.value,
    imageUrl: imageUrl.value,
    url: url.value,
  })
  title.value = ''
  description.value = ''
  imageUrl.value = ''
  content.value = ''
  url.value = ''
}
</script>
