import { createAuth0 } from '@auth0/auth0-vue'

/**
 * auth0 is an instance of the authentication client created using the createAuth0 method.
 * It is configured to manage authentication, authorization, and session persistence
 * with the specified Auth0 domain, client ID, redirection URI, and API audience.
 *
 * Properties for configuration:
 * - domain: Represents the Auth0 domain for the authentication service.
 * - clientId: The client ID associated with the Auth0 application.
 * - authorizationParams: Contains configuration options for authorization, such as:
 *   - redirect_uri: URI to which the user is redirected after authentication.
 *   - audience: Specifies the intended API audience to associate with issued tokens.
 */
export const auth0 = createAuth0({
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
  },
})
