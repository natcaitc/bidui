// @src/api/auth.jsj

// Import the Auth0 configuration
import { Auth0Client } from '@auth0/auth0-spa-js'

const auth0 = new Auth0Client({
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID,
  authorizationParams: { audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE },
})

export const getAuthToken = async () => {
  // Logic to retrieve or refresh the Auth0 token
  try {
    return await auth0.getTokenSilently();
  } catch (error) {
    console.error('Error getting token:', error);
    throw new Error('Failed to retrieve token');
  }
}
