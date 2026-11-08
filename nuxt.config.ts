export default defineNuxtConfig({
  compatibilityDate: '2026-11-04',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      siteUrl: '',
      cvUrl: '',
    },
  },
  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '天马的书房',
      meta: [
        { name: 'description', content: '拉开幕布，翻开一本书。在天马的书房，遇见简历、博客、小说与日常。' },
        { name: 'theme-color', content: '#24251f' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          href: '/fonts/pinyon-script/pinyon-script-latin-400-normal.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
      noscript: [{ innerHTML: '<style>.theatre-curtain{display:none!important}</style>' }],
    },
  },
})
