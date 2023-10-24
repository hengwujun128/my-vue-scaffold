module.exports = {
  // root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',

  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'eslint-config-prettier',
  ],
  // TIPS:
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    // "vue/multi-word-component-names": "off", // 禁用vue文件强制多个单词命名
    '@typescript-eslint/no-explicit-any': ['off'], //允许使用any
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowedNames: ['that'], // this可用的局部变量名称
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'off', //允许使用@ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off', //允许使用非空断言
    '@typescript-eslint/no-unused-vars': 'off', // ts 文件允许 console
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': [
      //提交时不允许有console.log
      'off',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'warn', //提交时不允许有debugger
  },
}
