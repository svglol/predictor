import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
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
