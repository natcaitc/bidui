/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
// import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Fontawesome imports
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { all } from '@awesome.me/kit-8a3b5a2f73/icons'

library.add(...all)
config.familyDefault = 'sharp' // set default so don't have to use 'fass' and 'fa-icon-name'
config.styleDefault = 'solid'

// Customize colors
const customTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FB8C00',
    error: '#FF5252',
    background: '#F8F8FA',
    surface: '#ffffff',
  },
}
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  icons: { // Use Fontawesome
    defaultSet: 'fa',
    aliases: { // Replace default fa.js.map for FA 6 Pro compatability when replacing MDI - map only works for FAS - FREE
      ...aliases,
      file: 'fass fa-paperclip',
      clear: 'fass fa-circle-xmark',
      last: 'fass fa-forward-step',
      sortAsc: 'fass fa-chevron-up',
      sortDesc: 'fass fa-chevron-down',
      next: 'fass fa-chevron-right',
      prev: 'fass fa-chevron-left',
      collapse: 'fass fa-chevron-up',
      complete: 'fass fa-check',
      cancel: 'fass fa-circle-xmark',
      close: 'fass fa-xmark',
      delete: 'fass fa-trash',
      success: 'fass fa-circle-check',
      info: 'fass fa-circle-info',
      warning: 'fass fa-triangle-exclamation',
      error: 'fass fa-octagon-exclamation',
      checkboxOn: 'fass fa-square-check',
      checkboxOff: 'far fa-square',
      delimeter: 'fass fa-circle-dot',
      expand: 'fass fa-chevron-down',
      menu: 'fass fa-bars',
      subgroup: 'fass fa-caret-down',
      dropdown: 'fass fa-caret-down',
      radioOn: 'fass fa-circle-dot',
      radioOff: 'far fa-circle',
      edit: 'fass fa-pen-to-square',
      ratingEmpty: 'far fa-star',
      ratingFull: 'fass fa-star',
      ratingHalf: 'fass fa-star-half-stroke',
      loading: 'fass fa-rotate',
      first: 'fass fa-backward-step',
      unfold: 'fass fa-up-down',
      plus: 'fass fa-plus',
      minus: 'fass fa-minus',
      calendar: 'fass fa-calendar',
      treeviewCollapse: 'fass fa-caret-down',
      treeviewExpand: 'fass fa-caret-up',
      eyeDropper: 'fass fa-eye-dropper',
    },
    sets: {
      fa,
    }
    ,
  },
  components: {
  }
  ,
  theme: {
    defaultTheme: 'customTheme',
    themes: { customTheme },
  }
  ,
})
