/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'
import { auth0 } from './auth0'

/**
 * @param {import("vue").App<Element>} app
 */
export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(auth0)
    .use(pinia)
    .use(router)
}
