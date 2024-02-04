module.exports = {
  extends: [
    'eslint:recommended',
    '@nuxt/eslint-config',
    '@nuxtjs/eslint-config-typescript',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'import/no-named-as-default': 'off',
    'import/named': 'off',
    'array-callback-return': 'off',
  },
}
