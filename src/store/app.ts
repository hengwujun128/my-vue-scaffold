import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    return {
      loading: false,
    }
  },
  getters: {},
  actions: {
    show() {
      this.loading = true
    },
    hide() {
      this.loading = false
    },
  },
})
