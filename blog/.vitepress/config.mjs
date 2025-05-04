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
      { 
        icon: {
          svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>'
        }, 
        link: 'https://www.threads.net/@this_is_adams_username',
        ariaLabel: 'threads'
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
