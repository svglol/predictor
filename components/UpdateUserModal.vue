<template>
  <UModal>
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>Update Profile</template>
      <div class="flex flex-col gap-2">
        <UFormGroup label="Username" required :error="valid">
          <UInput v-model="username" :disabled="loading" color="gray" />
        </UFormGroup>
        <UFormGroup
          label="Avatar"
          :error="validAvatar"
          :ui="{ container: 'flex flex-row gap-2 items-center' }">
          <UAvatar :src="avatar" :alt="username" size="3xl" />
          <Upload id="avatar" label="Upload Avatar" @upload="uploaded" />
        </UFormGroup>
      </div>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            color="primary"
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
import type { UploadApiResponse } from 'cloudinary'
import slugify from 'slugify'

const { $client } = useNuxtApp()

const emit = defineEmits(['update'])
const valid = ref('')
const validAvatar = ref('')
const { name, image, loading } = $defineProps<{
  name: string | null | undefined
  image: string | null | undefined
  loading: boolean
}>()

const username = ref(name ?? '')
const avatar = ref(image ?? '')

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
  // validate username
  const usersCount = await $client.users.getUserValid.query(username.value)
  if (username.value === '') {
    valid.value = 'Username must not be empty!'
  } else if (usersCount > 0 && username.value !== name) {
    valid.value = 'Username is already taken!'
  } else if (slugify(username.value, { lower: true }) !== username.value) {
    valid.value = 'Username must be one word and lowercase!'
  } else {
    valid.value = ''
  }

  // validate avatar
  if (avatar.value !== '') {
    if (!isUrlValid(avatar.value)) {
      validAvatar.value = 'Avatar URL is not valid!'
    } else {
      validAvatar.value = ''
    }
  } else {
    validAvatar.value = ''
  }

  if (valid.value === '' && validAvatar.value === '') return true
  else return false
}

function uploaded(data: Ref<UploadApiResponse>) {
  const img = useImage()
  avatar.value = img(
    data.value.public_id,
    { fit: 'fit', width: 256, height: 256 },
    {
      provider: 'cloudinary',
    }
  )
}
</script>
