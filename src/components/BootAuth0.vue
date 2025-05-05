<template>
  <!-- This component silently initializes Auth0 token for API client -->
  <div style="display: none" />
</template>

<script setup>
  import { useAuth0 } from '@auth0/auth0-vue'
  import apiClient from '@/api/client'

  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()

  onMounted(async () => {
    console.log('[BootAuth0] Waiting for Auth0 to be ready...')

    // Wait until Auth0 is fully loaded and authenticated
    const waitForAuth = async () => {
      let attempts = 0
      while (isLoading.value || !isAuthenticated.value) {
        if (attempts % 10 === 0) {
          console.log(`[BootAuth0] isLoading: ${isLoading.value}, isAuthenticated: ${isAuthenticated.value}`)
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
    }

    await waitForAuth()

    console.log('[BootAuth0] Auth0 is ready. Setting up apiClient...')

    if (!apiClient.tokenReady) {
      await apiClient.useAuth0TokenFunction(async () => {
        try {
          const token = await getAccessTokenSilently()
          console.log('[BootAuth0] Retrieved token from Auth0:', token)
          return token
        } catch (err) {
          console.error('[BootAuth0] Failed to retrieve token:', err)
          return null
        }
      })
      console.log('[BootAuth0] apiClient has been configured with Auth0 token.')
    } else {
      console.log('[BootAuth0] apiClient was already initialized.')
    }
  })
</script>
