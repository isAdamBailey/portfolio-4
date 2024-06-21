import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/assets/img/favicon.ico' }],
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
  ],
  title: "Adam Bailey",
  description: "A personal web portfolio for Adam Bailey",
  sitemap: {
    hostname: 'https://adambailey.io'
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/assets/img/logo.svg',
    sidebar: [
      {
        text: 'Articles',
        items: [
          { text: 'Accessible SVGs', link: '/blog/accessible-svgs' },
          { text: 'Getting Started', link: '/getting-started' },
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
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    editLink: {
      pattern: 'https://github.com/isAdamBailey/portfolio-4/edit/main/blog/:path',
      text: 'Edit this page on GitHub'
    },
    externalLinkIcon: true
  }
})
