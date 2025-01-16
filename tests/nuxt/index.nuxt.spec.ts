import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import app from '~/app.vue'

describe('app', () => {
  it('works', () => {
    expect(useNuxtApp().globalName).toEqual('nuxt')
  })
  it('app can be mounted', async () => {
    const component = await mountSuspended(app, { route: '/' })
    expect(component).toBeTruthy()
  })
})
