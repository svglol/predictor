<template>
  <main class="main">
    <div class="mx-auto min-h-screen flex-auto flex-col">
      <Header />
      <main class="container mx-auto">
        <slot />
      </main>
      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts"></script>
