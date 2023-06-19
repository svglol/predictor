<template>
  <div class="border-b p-4 dark:border-slate-100/10">
    <header class="mx-auto flex flex-wrap items-center justify-between">
      <NuxtLink to="/">
        <Logo />
      </NuxtLink>
      <div />
      <div class="flex justify-items-end space-x-2">
        <UDropdown
          :items="items"
          mode="click"
          :popper="{ placement: 'bottom-end' }"
          class="content-end"
          v-if:="status === 'authenticated'"
        >
          <UButton
            color="white"
            :label="sessionData?.user?.name"
            trailing-icon="i-heroicons-chevron-down-20-solid"
          >
            <template #leading>
              <UAvatar :src="sessionData?.user?.image" size="3xs" />
            </template>
          </UButton>
        </UDropdown>
        <UButton
          color="white"
          label="Sign in"
          v-if:="status === 'unauthenticated'"
          @click="signIn()"
        />

        <ClientOnly>
          <UButton
            :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
          />

          <template #fallback>
            <div class="h-8 w-8" />
          </template>
        </ClientOnly>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { data: sessionData, status, signIn, signOut } = useAuth()
const colorMode = useColorMode()
let items = ref([
  [
    {
      label: "Profile",
      avatar: {
        src: sessionData.value?.user?.image,
      },
      to: "/profile",
    },
    {
      label: "Dashboard",
      icon: "i-heroicons-home",
      to: "/admin",
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-heroicons-arrow-right-on-rectangle-20-solid",
      click: () => {
        signOut()
      },
    },
  ],
])
if (sessionData.value?.user?.role !== "ADMIN") {
  items.value.forEach(
    (item, i, self) =>
      (self[i] = item.filter((item2) => item2.label !== "Dashboard"))
  )
}

const isDark = computed({
  get() {
    return colorMode.value === "dark"
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark"
  },
})
</script>
