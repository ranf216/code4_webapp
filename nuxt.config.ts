// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  app: {
    head: {
      title: 'Code4Axis',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        {
          rel: 'preload',
          href: '/fonts/Geist-Variable.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: '/map/maptool.min.css',
          type: 'text/css',
        },
      ],
      script: [
        {
          src: '/map/maptool.min.js',
          type: 'text/javascript',
        },
      ],
    },
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
  ],


  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      googleMapsApiKey: '',
      apiUrl: '',
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@googlemaps/js-api-loader', 'socket.io-client'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})