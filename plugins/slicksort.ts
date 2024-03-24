import {
  DragHandle,
  HandleDirective,
  SlickItem,
  SlickList,
  plugin as Slicksort,
} from 'vue-slicksort'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive(HandleDirective)
  nuxtApp.vueApp.component('SlickItem', SlickItem)
  nuxtApp.vueApp.component('SlickList', SlickList)
  nuxtApp.vueApp.component('DragHandle', DragHandle)
  nuxtApp.vueApp.use(Slicksort)
})
