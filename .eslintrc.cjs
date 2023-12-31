module.exports = {
  extends: ['@nuxt/eslint-config', 'prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: { 'vue/no-v-html': 'off', 'vue/multi-word-component-names': 'off' },
}
