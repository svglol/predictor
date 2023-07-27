<template>
  <main class="main">
    <div class="flex min-h-screen flex-auto flex-col">
      <Header />
      <div class="container mx-auto grid grow p-4"><slot /></div>
      <Footer />
    </div>
  </main>
</template>

<script setup lang="ts"></script>
