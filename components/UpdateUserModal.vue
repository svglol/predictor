<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <div class="flex flex-col gap-2">
        <UFormGroup label="Username" required :error="valid">
          <UInput v-model="username" :disabled="loading" />
        </UFormGroup>
        <UFormGroup label="Avatar URL" :error="validAvatar">
          <UInput v-model="avatar" :disabled="loading" />
        </UFormGroup>
      </div>
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
import type { User } from '@prisma/client'
const { $client } = useNuxtApp()

const emit = defineEmits(['update'])
const valid = ref('')
const validAvatar = ref('')
const { user, loading } = $defineProps<{
  user: User
  loading: boolean
}>()

const username = ref(user.name ?? '')
const avatar = ref(user.image ?? '')

watchDebounced(
  username,
  () => {
    validate()
  },
  { debounce: 500, maxWait: 1000 }
)

const update = async () => {
  if (await validate()) {
    emit('update', username.value, avatar.value)
  }
}

const validate = async () => {
  //validate username
  const usersCount = await $client.users.getUserValid.query(username.value)
  if (username.value === '') {
    valid.value = 'Username must not be empty!'
  } else if (usersCount > 0 && username.value !== user.name) {
    valid.value = 'Username is already taken!'
  } else {
    valid.value = ''
  }

  //validate avatar
  if (avatar.value !== '') {
    if (!isUrlValid(avatar.value)) {
      validAvatar.value = 'Avatar URL is not valid!'
    } else if (!isImage(avatar.value)) {
      validAvatar.value = 'Avatar URL is not an image!'
    } else {
      validAvatar.value = ''
    }
  } else {
    validAvatar.value = ''
  }

  if (valid.value === '' && validAvatar.value === '') return true
  else return false
}
</script>
