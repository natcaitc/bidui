// client.js
// Create axios object for use in project
import axios from 'axios'
import { getAuthToken } from '@/api/auth.js'

class ApiClient {
  constructor () {
    // Set the baseURL from .env
    this.baseURL = `${import.meta.env.VITE_BASE_URL || 'https://bidatc.com'}/api`;

    // Create the axios instance
    this.client = axios.create({
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      baseURL: this.baseURL,
      withCredentials: true,
    })

    // Check Auth0 toggle for dev
    if (process.env.NODE_ENV !== 'development' && !import.meta.env.VITE_USE_AUTH0) {
      this.initializeInterceptors();
    }
  }

  //   // Use Axios Interceptor to attach the Auth0 Access Token to all requests
  //   const setAxiosTokenInterceptor = async () => {
  //     // Check to see if there is a valid token in storage
  //     // Fetch the token
  //     await auth0.getTokenSilently()
  //       .then(token => {
  //         // Set the header for all requests
  //         this.client.interceptors.request.use(async config => {
  //           const requestConfig = config
  //           if (token) {
  //             requestConfig.headers.Authorization = `Bearer ${token}`
  //           }
  //           return requestConfig
  //         })
  //       })
  //       .catch(e => {
  //         console.log(e)
  //       })
  //
  //   // Use Axios Interceptor to catch when user is no longer logged in and redirect
  //   this.client.interceptors.response.use(
  //     response => {
  //       return response
  //     },
  //     error => {
  //       // If the token is expired then catch it
  //       if (error.response.status === 401) {
  //         window.location.href = '/'
  //       }
  //
  //       return Promise.reject(error)
  //     })
  // }

  initializeInterceptors () {
    this.client.interceptors.request.use(async config => {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, error => {
      return Promise.reject(error);
    });

    this.client.interceptors.response.use(response => response, error => {
      if (error.response && error.response.status === 401) {
        // Handle 401 errors
        window.location.href = '/'; // No session so redirect to home
      }
      return Promise.reject(error);
    });
  }

  // Set the facilityId if context defined - validate before setting!
  setBaseURL (path) {
    this.client.defaults.baseURL = `${this.baseURL}/${path}`;
  }

  get (url, data, config) {
    const c = {
      ...config,
      params: { ...data },
    }
    return this.client.get(url, c)
  }
  post (url, data, config) {
    return this.client.post(url, data, config)
  }
  put (url, data, config) {
    return this.client.put(url, data, config)
  }
  delete (url, config= null) {
    return this.client.delete(url, config)
  }
}

const apiClient = new ApiClient();
export default apiClient;
