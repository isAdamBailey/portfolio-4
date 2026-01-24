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
  lastUpdated: true,
  titleTemplate: ':title | Adam Bailey',
  transformPageData(pageData) {
    pageData.frontmatter.head ??= []

    const baseUrl = 'https://adambailey.io'
    const path = '/' + pageData.relativePath.replace(/(index)?\.md$/, '')
    const url = path === '//' ? baseUrl + '/' : baseUrl + path

    const pageTitle = pageData.title || 'Adam Bailey'
    const pageDescription = pageData.description || 'A personal web portfolio for Adam Bailey'

    const explicitImage = pageData.frontmatter.image || pageData.frontmatter.ogImage
    const resolvedExplicitImage = explicitImage
      ? (explicitImage.startsWith('http') ? explicitImage : baseUrl + explicitImage)
      : null
    const ogImage = resolvedExplicitImage || (baseUrl + '/logo-og.png')

    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: ogImage }],
      [
        'script',
        { type: 'application/ld+json' },
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Adam Bailey',
          url: baseUrl,
          sameAs: [
            'https://github.com/isAdamBailey',
            'https://www.linkedin.com/in/adambailey2',
            'https://bsky.app/profile/adambailey.io'
          ]
        })
      ]
    )
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
          { text: 'How to Use the YouTube Data API in Laravel', link: '/blog/youtube-data-api-sync' },
          { text: 'AI Dev Toil', link: '/blog/ai-dev-toil-7-prompts' },
          { text: 'AI Time Savings for Mental Clarity', link: '/blog/ai-time-mental-clarity-balance' },
          { text: 'Laravel Caching Basics', link: '/blog/laravel-cache-basics' },
          { text: 'InertiaJs Deferred Data', link: '/blog/inertia-deferred-data' },
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
      { 
        icon: { 
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>'
        }, 
        link: 'https://bsky.app/profile/adambailey.io',
        ariaLabel: 'bluesky'
      },
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
