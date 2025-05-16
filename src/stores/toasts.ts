import { defineStore } from 'pinia'

interface ToastOptions {
  message: string
  color?: string
  timeout?: number
  title?: string | null
}

interface ToastState {
  snackbar: boolean
  title: string | null
  message: string
  color: string
  timeout: number
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    snackbar: false,
    title: null,
    message: '',
    color: 'success',
    timeout: 3000,
  }),
  actions: {
    showMessage ({ message, color = 'success', timeout = 3000, title = null }: ToastOptions) {
      this.title = title
      this.message = message
      this.color = color
      this.timeout = timeout
      this.snackbar = true
    },
    hideMessage () {
      this.snackbar = false
    },
  },
})
