import mitt from 'mitt'
const emitter = mitt()
export default defineNuxtPlugin(() => {
  const bus = { $on: emitter.on, $emit: emitter.emit }
  return {
    provide: {
      bus: bus,
    },
  }
})
