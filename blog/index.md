---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Adam Bailey"
  text: "A personal web portfolio and blog"
  phrases:
    - "A personal web portfolio"
    - "A blog"
    - "A journal"
    - "A developer's notebook"
    - "A collection of side projects"
    - "A corner of the internet"
    - "A place for code and music"
    - "A digital scrapbook"
    - "A work in progress"
    - "A rubber duck with a domain name"
    - "A console.log of my brain"
    - "A graveyard of side projects"
    - "A README with feelings"
    - "A drum solo in Markdown"
    - "A collection of mildly warm takes"
    - "A tab you forgot to close"
    - "A commit history with opinions"
---

<script setup>
import { data as posts } from './blog.data.mjs';
import ArticleCard from './components/ArticleCard.vue'
</script>

<ArticleCard v-for="(post, index) of posts" 
    :href="post.url" 
    :frontmatter="post.frontmatter"
    :key="index" 
/>