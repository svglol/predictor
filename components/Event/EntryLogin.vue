<template>
  <div class="flex w-full items-center">
    <div class="flex min-h-0 w-full flex-col items-center justify-center py-8">
      <h1
        class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        Sign in
      </h1>
      <p class="mt-6 text-center text-base/7 text-gray-500 dark:text-gray-400">
        To complete your prediction please sign in.
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <UButton size="lg" :to="`/auth/sign-in?callbackUrl=${$route.fullPath}`">
          Sign in
        </UButton>
      </div>
    </div>
  </div>
</template>
