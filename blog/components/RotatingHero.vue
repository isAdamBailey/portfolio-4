<template>
  <h1 class="heading">
    <span class="name clip" :class="{ sparkle }">
      <span class="sr-only">{{ name }}</span>
      <span
        v-for="(letter, i) in letters"
        :key="i"
        class="letter"
        :style="{ '--i': i }"
        aria-hidden="true"
      >{{ letter }}</span>
      <template v-if="sparkle">
        <svg
          v-for="(star, i) in stars"
          :key="`star-${i}`"
          class="star"
          :style="star"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0C12.6 6.6 17.4 11.4 24 12C17.4 12.6 12.6 17.4 12 24C11.4 17.4 6.6 12.6 0 12C6.6 11.4 11.4 6.6 12 0Z" />
        </svg>
      </template>
    </span>
    <span class="text">
      <Transition name="swap" mode="out-in">
        <span :key="current" class="phrase"><span class="first-word">{{ phrase.first }}</span>{{ phrase.rest }}</span>
      </Transition>
    </span>
  </h1>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

// Module-level so the sparkle only plays on the first page load,
// not every time you navigate back to the home page.
let hasSparkled = false;

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  phrases: {
    type: Array,
    required: true,
  },
  interval: {
    type: Number,
    default: 3000,
  },
});

const sparkle = ref(!hasSparkled);
const letters = computed(() => [...props.name]);

// Where each sparkle sits around the name, and when it twinkles
const stars = [
  { left: "-4%", top: "10%", "--size": "0.35em", "--delay": "0.2s" },
  { left: "22%", top: "-20%", "--size": "0.25em", "--delay": "0.45s" },
  { left: "48%", top: "70%", "--size": "0.3em", "--delay": "0.6s" },
  { left: "70%", top: "-15%", "--size": "0.4em", "--delay": "0.8s" },
  { left: "96%", top: "45%", "--size": "0.3em", "--delay": "1s" },
];

const current = ref(0);

// The first word ("A") gets the brand color to match the name
const phrase = computed(() => {
  const [, first, rest] = props.phrases[current.value].match(/^(\S+)(.*)$/s);
  return { first, rest };
});

let timer;

function next() {
  if (props.phrases.length < 2) return;

  let index;
  do {
    index = Math.floor(Math.random() * props.phrases.length);
  } while (index === current.value);

  current.value = index;
}

onMounted(() => {
  hasSparkled = true;
  timer = setInterval(next, props.interval);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.heading {
  display: flex;
  flex-direction: column;
}

.name,
.text {
  width: fit-content;
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

.name {
  color: var(--vp-home-hero-name-color);
}

.name {
  position: relative;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.letter {
  display: inline-block;
}

.sparkle .letter {
  animation: letter-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--i) * 45ms);
}

.star {
  position: absolute;
  width: var(--size);
  height: var(--size);
  fill: var(--vp-c-brand-1);
  pointer-events: none;
  opacity: 0;
  animation: twinkle 0.9s ease-in-out var(--delay) both;
}

@keyframes letter-in {
  from {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.25em) scale(0.8);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: none;
  }
}

@keyframes twinkle {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(90deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(180deg);
  }
}

.clip {
  background: var(--vp-home-hero-name-background);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: var(--vp-home-hero-name-color);
}

/* Reserve two lines so longer phrases don't push the page around */
.text {
  min-height: 80px;
}

.phrase {
  display: inline-block;
}

.first-word {
  color: var(--vp-home-hero-name-color);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(0.4em);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-0.4em);
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-from,
  .swap-leave-to {
    transform: none;
  }

  .sparkle .letter {
    animation-name: fade-in;
  }

  .star {
    display: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@media (min-width: 640px) {
  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }

  .text {
    min-height: 112px;
  }
}

@media (min-width: 960px) {
  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }

  .text {
    min-height: 128px;
  }
}
</style>
