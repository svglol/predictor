<template>
  <div
    class="w-full max-w-screen-sm divide-y divide-gray-200 rounded border border-gray-200 bg-gray-100 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
    <div class="flex flex-row items-center justify-between gap-8 p-2 px-4">
      <span class="font-bold text-black dark:text-white">Notifications</span>
      <div class="flex flex-row gap-1">
        <UTooltip text="Refresh">
          <UButton
            :loading="isLoading"
            color="gray"
            variant="ghost"
            icon="material-symbols:refresh"
            @click="refresh" />
        </UTooltip>
        <UTooltip text="Mark all as read">
          <UButton
            :loading="isLoading"
            color="gray"
            variant="ghost"
            icon="material-symbols:mark-email-read-sharp"
            @click="markAllAsRead" />
        </UTooltip>
      </div>
    </div>
    <div
      v-for="notification in notifications?.slice(0, 5) ?? []"
      :key="notification.id"
      class="flex max-w-[28rem] flex-row gap-2 p-2 px-4">
      <NuxtLink
        :to="notification.url"
        class="flex flex-row items-center gap-4 hover:opacity-80">
        <UIcon
          v-if="notification.icon"
          :name="notification.icon"
          class="text-primary-400 dark:text-primary-500" />
        <div class="flex flex-col gap-0">
          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
            {{ notification.body }}
          </span>
          <NuxtTime
            :datetime="notification.createdAt"
            second="numeric"
            minute="numeric"
            hour="numeric"
            month="long"
            day="numeric"
            year="numeric"
            class="text-xs" />
        </div>
      </NuxtLink>
      <UTooltip text="Mark as read" class="ml-auto">
        <UButton
          color="gray"
          variant="ghost"
          size="xs"
          icon="material-symbols:close"
          @click="markAsRead(notification.id)" />
      </UTooltip>
    </div>
    <template v-if="(notifications?.length ?? 0) > 5">
      <div class="w-full py-2 text-center sm:min-w-[28rem]">
        <span class="text-sm font-bold">
          There is {{ (notifications?.length ?? 0) - 5 }} more unread
          notifications
        </span>
      </div>
    </template>
    <template v-if="notifications?.length === 0">
      <div class="w-full py-2 text-center sm:min-w-[28rem]">
        <span class="text-sm font-bold">Notifications are empty!</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
const { notifications } = $defineProps<{
  notifications: UserNotification[] | null
}>()

const { $client } = useNuxtApp()
const isLoading = ref(false)

async function refresh() {
  isLoading.value = true
  const notifications = useState('userNotifications', () => []) as Ref<
    UserNotification[] | null
  >
  if (notifications) {
    const { data } = await $client.users.getNotifications.useQuery()
    notifications.value = data.value
  }
  isLoading.value = false
}

function markAllAsRead() {
  isLoading.value = true
  const notifications = useState('userNotifications', () => []) as Ref<
    UserNotification[] | null
  >
  if (notifications) {
    notifications.value = []
    $client.users.markAllNotificationsAsRead.mutate()
  }
  isLoading.value = false
}

async function markAsRead(id: number) {
  const notifications = useState('userNotifications', () => []) as Ref<
    UserNotification[] | null
  >
  if (notifications) {
    const mutate = await $client.users.markNotificationAsRead.mutate(id)
    if (mutate && notifications) {
      notifications.value = mutate
    }
  }
}
</script>
