---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Adam Bailey"
  text: "A personal web portfolio and blog"
  tagline: My great project tagline
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