import { defineConfig } from 'vitepress'

const inProd = process.env.NODE_ENV === 'production'

const head = [
  ['link', { rel: 'icon', href: '/favicon.ico' }]
]

if (inProd) {
  head.push(
      [
        'script',
        { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-D7EXNLPQCF' }
      ],
      [
        'script',
        {},
        `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-D7EXNLPQCF');`
      ]
  )
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head,
  title: "Adam Bailey",
  description: "A personal web portfolio for Adam Bailey",
  sitemap: {
    hostname: 'https://adambailey.io'
  },
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    sidebar: [
      {
        text: 'Articles',
        items: [
          { text: 'Accessible SVGs', link: '/blog/accessible-svgs' },
          { text: 'Dockerize a Laravel Application', link: '/blog/dockerize-a-laravel-application' },
          { text: 'Generators in PHP', link: '/blog/generators-in-php' },
          { text: 'Jetstream Search Input', link: '/blog/jetstream-search-input' },
          { text: 'Create GitHub Repo on a New Laravel Project', link: '/blog/laravel-new-github-repo' },
          { text: 'Simple Vue.js and Tailwind.css Scroll To Top Button', link: '/blog/scroll-to-top-button-vue' },
          { text: 'VueJs Search Input With SpeechRecognition API', link: '/blog/vue-search-input-speech-recognition' },
          { text: 'Sensory Processing Disorder', link: '/blog/sensory-processing-disorder' },
        ]
      }
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/isAdamBailey' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/adambailey2' },
      { icon: 'x', link: 'https://x.com/isAdamBailey' },
    ],
    search: {
      provider: 'local'
    },
    footer: {
      copyright: 'Copyright © 2024-present Adam Bailey'
    },
    editLink: {
      pattern: 'https://github.com/isAdamBailey/portfolio-4/edit/main/blog/:path',
      text: 'Edit this page on GitHub'
    },
    externalLinkIcon: true
  }
})
