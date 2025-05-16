// client.js
import axios from 'axios'
import { auth0 } from '@/plugins/auth0.js';

class ApiClient {
  constructor () {
    this.baseURL = `${import.meta.env.VITE_BASE_URL || 'https://bidatc.com'}/api`

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    })
  }

  async checkToken () {
    console.log('[ApiClient::checkToken] Auth0 token acquired')
    return await auth0.getAccessTokenSilently()
  }

  async setAuthInterceptor () {
    console.log('[ApiClient] Setting up Auth0 interceptor')
    try {
      const token = await auth0.getAccessTokenSilently()
      console.log('[ApiClient] Auth0 token acquired', token)
      if (token) {
        this.client.interceptors.request.use(async config => {
          console.log('Token exists, attaching to request')
          config.headers.Authorization = `Bearer ${token}`
          return config
        })
      } else {
        console.warn('Auth token not available:')
      }

      this.client.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            // window.location.href = '/'
            console.log('401: interceptor response failed')
          }
          return Promise.reject(error)
        }
      )
    } catch (e) {
      console.warn('[apiClient::setAuthInterceptor] - Auth token not available:', e)
    }
  }

  // ---- API Methods ----
  setBaseURL (path) {
    this.client.defaults.baseURL = `${this.baseURL}` + (path ? `/${path}` : '')
  }

  async get (url, data = {}, config = {}) {
    console.log('[ApiClient] Set Interceptor', url, data, config)
    await this.setAuthInterceptor()
    console.log('[ApiClient] GET', url, data, config)
    return await this.client.get(url, { ...config, params: { ...data } })
  }

  post (url, data, config) {
    return this.client.post(url, data, config)
  }

  put (url, data, config) {
    return this.client.put(url, data, config)
  }

  delete (url, config = {}) {
    return this.client.delete(url, config)
  }
}

const apiClient = new ApiClient()
export default apiClient
