// client.js
import axios from 'axios'

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

    this.getAuthToken = null // will be injected later
    this._readyResolver = null
    this.ready = new Promise(resolve => {
      this._readyResolver = resolve
    })
  }

  /**
   * Set up the client with a token getter function from Auth0
   * @param {Function} getTokenFn - Function that returns a promise resolving to a token
   */
  async useAuth0TokenFunction (getTokenFn) {
    this.getAuthToken = getTokenFn
    await this.setAuthInterceptor()
    this._readyResolver() // Resolve the promise now that the client is ready
  }

  async setAuthInterceptor () {
    this.client.interceptors.request.use(async config => {
      try {
        console.log('try to intercept')
        if (this.getAuthToken) {
          const token = await this.getAuthToken()
          console.log('🔐 Attaching token:', token)

          if (token) {
            console.log('Token exists, attaching to request')
            config.headers.Authorization = `Bearer ${token}`
          }
        }
      } catch (err) {
        console.warn('Auth token not available:', err)
      }
      return config
    })

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
  }

  // Fallback for local dev without Auth0
  initializeInterceptorsWithStaticToken (getAuthToken) {
    this.client.interceptors.request.use(async config => {
      const token = await getAuthToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // ---- API Methods ----
  setBaseURL (path) {
    this.client.defaults.baseURL = `${this.baseURL}/${path}`
  }

  get (url, data = {}, config = {}) {
    return this.client.get(url, { ...config, params: { ...data } })
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
