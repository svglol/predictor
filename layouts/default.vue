<template>
  <main class="main">
    <div class="mx-auto flex-auto flex-col min-h-screen">
      <Header />
      <main class="container mx-auto ">
        <slot />
      </main>
      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts">
</script>