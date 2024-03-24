<template>
  <UModal>
    <UCard
      :ui="{
        header: {
          padding: '!p-0',
        },
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="relative">
          <NuxtImg
            v-if="avatar"
            width="1920"
            height="1080"
            fit="cover"
            :src="avatar"
            placeholder
            class="absolute inset-0 size-full rounded-t-lg object-cover"
            style="aspect-ratio: 1920 / 1080; object-fit: cover"
          />

          <div
            class="relative z-10 flex h-full flex-col items-center justify-center gap-2 rounded-t-lg bg-black bg-opacity-50 p-4 text-center text-white backdrop-blur-lg md:px-4"
          >
            <UAvatar
              :src="img(avatar, { width: 80, height: 80 })"
              :alt="username"
              size="3xl"
            />
            <span class="text-xl font-bold">{{ username }}</span>
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-4">
        <UFormGroup label="Username" required :error="valid">
          <UInput v-model="username" :disabled="loading" color="gray" />
        </UFormGroup>
        <UDivider />
        <UFormGroup
          label="Avatar"
          :error="validAvatar"
          :ui="{ container: 'flex flex-row items-center gap-2' }"
        >
          <div>
            <Upload label="Change Avatar" @upload="uploaded" />
          </div>
          <div>
            <UButton
              label="Remove Avatar"
              variant="link"
              @click="removeAvatar"
            />
          </div>
        </UFormGroup>
      </div>
      <template #footer>
        <div class="flex flex-row-reverse">
          <UButton
            color="primary"
            class="self-end"
            :disabled="valid !== '' || loading"
            :loading="loading"
            @click="update"
          >
            Save Changes
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import type { UploadApiResponse } from 'cloudinary'

const emit = defineEmits(['update'])
const { $client } = useNuxtApp()
const img = useImage()

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
  { debounce: 500, maxWait: 1000 },
)

async function update() {
  if (await validate())
    emit('update', username.value, avatar.value)
}

function removeAvatar() {
  avatar.value = `https://api.dicebear.com/6.x/bottts/svg?seed=${username.value}`
}

async function validate() {
  // validate username
  const usersCount = await $client.users.getUserValid.query(username.value)
  if (username.value === '') {
    valid.value = 'Username must not be empty!'
  }
  else if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
    valid.value = 'Username is not valid!'
    return false
  }
  else if (usersCount !== 0 && username.value !== name) {
    valid.value = 'Username is already taken!'
  }
  else {
    valid.value = ''
  }

  // validate avatar
  if (avatar.value !== '') {
    if (!isUrlValid(avatar.value))
      validAvatar.value = 'Avatar URL is not valid!'
    else
      validAvatar.value = ''
  }
  else {
    validAvatar.value = ''
  }

  if (valid.value === '' && validAvatar.value === '')
    return true
  else return false
}

function uploaded(data: Ref<UploadApiResponse>) {
  const img = useImage()
  avatar.value = img(
    data.value.public_id,
    {},
    {
      provider: 'cloudinary',
    },
  )
}
</script>
