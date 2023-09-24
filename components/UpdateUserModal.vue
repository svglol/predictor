<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <UFormGroup label="Username" required :error="valid">
        <UInput v-model="username" :disabled="loading" />
      </UFormGroup>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            color="green"
            class="self-end"
            :disabled="valid !== '' || loading"
            :loading="loading"
            @click="update">
            Submit
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { User } from '@prisma/client'
const { $client } = useNuxtApp()

const emit = defineEmits(['update'])
const valid = ref('')
const { user, loading } = $defineProps<{
  user: User
  loading: boolean
}>()

const username = ref(user.name ?? '')

watchDebounced(
  username,
  () => {
    validate()
  },
  { debounce: 500, maxWait: 1000 }
)

const update = async () => {
  if (await validate()) {
    emit('update', username.value)
  }
}

const validate = async () => {
  const usersCount = await $client.users.getUserValid.query(username.value)
  if (username.value === '') {
    valid.value = 'Username must not be empty!'
  } else if (usersCount > 0 && username.value !== user.name) {
    valid.value = 'Username is already taken!'
  } else {
    valid.value = ''
  }
  if (valid.value === '') return true
  else return false
}
</script>
