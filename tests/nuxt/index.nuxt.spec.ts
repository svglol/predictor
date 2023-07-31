import { describe, it, expect } from 'vitest'

describe('something', () => {
  it('works', () => {
    expect(useNuxtApp().globalName).toEqual('nuxt')
  })
})
