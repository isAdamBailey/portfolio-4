<template>
  <a :href="href">
    <article class="card">
      <div>
        <h2 class="title">{{ frontmatter.title }}</h2>
        <p class="details">{{ frontmatter.description }}</p>
      </div>
      <p class="date">{{ date }}</p>
    </article>
  </a>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
  href: {
    type: String,
    required: true,
  }
});

const date = computed(() => new Date(props.frontmatter.date).toLocaleDateString());
</script>

<style scoped>
.vp-doc a {
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.card {
  display: flex;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  justify-content: space-between;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  width: 100%;
  transition: border-color 0.25s, background-color 0.25s;
}

.card:hover {
  background-color: var(--vp-c-bg-soft);
  border: solid 1px var(--vp-c-brand-1);
}

.details {
  margin-left: 1.2rem;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.title {
  border-top: none;
  margin: 0 1.2rem;
}

.date {
  margin-right: 1.2rem;
  font-size: 14px;
}

@media (max-width: 960px) {
  .title {
    font-size: 16px;
  }
}
</style>