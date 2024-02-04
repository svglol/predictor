import { setup, createPage, $fetch } from '@nuxt/test-utils/e2e'
import { describe, it, expect } from 'vitest'
await setup({
  browser: true,
})
describe('browser', () => {
  it('renders the index page', async () => {
    const page = await createPage('/')
    const html = await page.innerHTML('body')
    expect(html).toContain('Memespeak Predictor')
  })
})

describe('server-rendered', () => {
  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Memespeak Predictor')
  })
})
