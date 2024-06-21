<template>
  <a :href="href">
    <article class="card">
      <div class="details">
        <h2 class="title">{{ frontmatter.title }}</h2>
        <p>{{ frontmatter.description }}</p>
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
a {
  text-decoration: none;
}
.card {
  display: flex;
  background-color: var(--vp-c-gray-soft);
  justify-content: space-between;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.card:hover {
  background-color: var(--vp-c-bg-soft);
}

.details {
  margin-left: 1.2rem;
}

.title {
  border-top: none;
  margin: 0 0;
}

.date {
  margin-right: 1.2rem;
}
</style>