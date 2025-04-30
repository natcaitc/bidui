/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import './styles/styles.scss';

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'/**/

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon) // Register component globally
registerPlugins(app)

app.mount('#app')
