import ConfettiExplosion from 'vue-confetti-explosion'
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(ConfettiExplosion)
})
