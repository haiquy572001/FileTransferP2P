export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'file-sharing-client',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {rel:'stylesheet',href:'https://www.w3schools.com/w3css/4/w3.css'},
      {rel:'stylesheet',href:'https://www.w3schools.com/lib/w3-theme-blue-grey.css'},
      {rel:'stylesheet',href:'https://fonts.googleapis.com/css?family=Open+Sans'},
      {rel:'stylesheet',href:'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'},
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{
    src: "~/plugins/dialog",
    ssr: false
  },{
    src:"~/plugins/notification",
    ssr:false
  }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@braid/vue-formulate/nuxt'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios'
  ],
  axios: {
    //baseURL: "https://api.sucodev.jp/api/v1"
    //baseURL:"http://localhost:5000"
    baseURL: "https://file-sharing-gz-api.herokuapp.com"
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
