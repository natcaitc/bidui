/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'
import { registerAuth0 } from './auth0'

export function registerPlugins (app) {
  registerAuth0(app)

  app
    .use(vuetify)
    .use(router)
    .use(pinia)
}
