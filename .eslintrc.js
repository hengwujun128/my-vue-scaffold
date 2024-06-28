module.exports = {
  root: true,
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
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    // 'eslint:recommended',
    'plugin:prettier/recommended',
    // 'eslint-config-prettier',
  ],
  // TIPS:
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  rules: {
    'vue/multi-word-component-names': 'off', // 禁用vue文件强制多个单词命名
    'vue/no-setup-props-destructure': 'off',
    '@typescript-eslint/no-explicit-any': ['off'], //允许使用any warn,error
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowedNames: ['that'], // this可用的局部变量名称
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'off', //允许使用@ts-ignore
    '@typescript-eslint/no-non-null-assertion': 'off', //允许使用非空断言
    // TIPS: 关闭错误 与 打开错误但是修改错误等级
    '@typescript-eslint/no-unused-vars': 'off', // 关闭
    // '@typescript-eslint/no-unused-vars': ['warn'], // 修改等级
    '@typescript-eslint/no-var-requires': 'off',

    'no-console': [
      //提交时不允许有console.log
      'off',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'warn', //提交时不允许有debugger,
  },
}
