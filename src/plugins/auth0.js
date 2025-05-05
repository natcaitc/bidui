import { createAuth0 } from '@auth0/auth0-vue'

export function registerAuth0 (app) {
  const auth0Instance = createAuth0({
    domain: import.meta.env.VITE_APP_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
    },
  })

  app.use(auth0Instance)
}
