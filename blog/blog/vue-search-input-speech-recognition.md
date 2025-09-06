---
title: "Vue Search Input with the Web SpeechRecognition API"
date: 2024-2-25
description: "Add click‑to‑speak voice search to a Vue input using the Web Speech API, with debouncing and visual listening states."
image: /logo-og.png
featured: true
---

# VueJs Search Input With SpeechRecognition API

A search input for VueJs and Tailwind that uses the SpeechRecognition API.

I recently needed to incorporate Speech Recognition to an existing search input on a VueJs application.
This post outlines how I did that, and gives you a reasonably good starting point to do the same.

## What is the SpeechRecognition API?

> [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition):
>
> SpeechRecognition is a Web Speech API interface that allows you to convert speech to text using Javascript in the browser.

This Post picks up from a search input I had already built using VueJs and Tailwind in Laravel JetStream application using IntertiaJS.
The article describing how to build this search input can be found [here](/blog/jetstream-search-input).

## The Search Input Component

Here's the entire component where we left off in the previous article:

```vue
<template>
  <div class="w-1/2 bg-white px-4 dark:bg-gray-800">
    <label for="search" class="hidden">Search</label>
    <input
        id="search"
        ref="searchRef"
        v-model="search"
        class="h-10 w-full cursor-pointer rounded-full border border-gray-500 bg-gray-100 px-4 pb-0 pt-px text-gray-700 outline-none transition focus:border-purple-400"
        :class="{ 'transition-border': search }"
        autocomplete="off"
        name="search"
        placeholder="Search"
        type="search"
        @keyup.esc="search = null"
    />
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { Inertia } from '@inertiajs/inertia';
  import { debounce } from 'lodash';

  const props = defineProps({
    routeName: String,
  });

  let search = ref(null);
  let sort = ref(null);
  const searchRef = ref(null);

  watch(search, () => {
    if (search.value) {
      searchMethod();
    } else {
      Inertia.get(route(props.routeName));
    }
  });

  const searchMethod = debounce(() => {
    Inertia.get(
        route(props.routeName),
        { search: search.value, sort: sort.value },
        { preserveState: false }
    );
  }, 2000);
</script>
```
We have a:

- Slightly styled input field.
- Single prop of `routeName` which accepts the route name from the Laravel route above, such as `'stories.index'`.
- Data property that looks in the inertia page props for a search value.
- Watcher on that `search` data property.
- Method that uses [lodash `debounce`](https://lodash.com/docs/4.17.15#debounce) to only fetch results every 500 milliseconds.

## Adding Speech Recognition

let's add a button to enable the listener for the SpeechRecognition API.
Just below the input field, add a button:

```html
<button @click="startVoiceRecognition">
    Click to start voice recognition!
</button>
```

And in the `script` section, we add the `startVoiceRecognition` method we called in the template:

```vue
<script setup>
    const startVoiceRecognition = () => {
        const recognition = new (window.SpeechRecognition ||
            window.webkitSpeechRecognition)();
        recognition.interimResults = true;
    
        recognition.addEventListener("result", (event) => {
            let transcript = Array.from(event.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join("");
            
            if (event.results[0].isFinal) {
                this.search = transcript;
            }
        });
        
        recognition.start();
    },
</script>
```

This method creates a new instance of the `SpeechRecognition` object, and sets the
[`interimResults`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults) property to `true`.
When `event.results[0].isFinal` is `true`, it sets the `search` data property to the `transcript` value from the `results` event.

This alone should be enough to get the speech recognition working in your search input, but we can do a little more to
improve the user experience.

## Add start and end event listeners

Since we don't yet have anything telling the user the input is listening, we can add a `listening` data property to use
for toggling styles on the button.

```vue
<script setup>
  let search = ref(null);
  let sort = ref(null);
  const searchRef = ref(null);
  const listening = ref(false); // [!code ++]
</script>
```
We will add event listeners for the `start` and `end` events of the SpeechRecognition API. Add this right before the
`recognition.start()` method:

```vue
<script setup>
  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
    recognition.interimResults = true;

    recognition.addEventListener("result", (event) => {
      let transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
      
      if (event.results[0].isFinal) {
        this.search = transcript;
      }
    });

    // keep the voice active state in sync with the recognition state
    recognition.addEventListener("start", () => { // [!code ++]
      listening.value = true; // [!code ++]
    }); // [!code ++]

    recognition.addEventListener("end", () => { // [!code ++]
      listening.value = false; // [!code ++]
    }); // [!code ++]

    recognition.start();
  },
</script>
```

Now we can use the `listening` data property to toggle the input and button's styles:
```js
<input
    id="search"
    ref="searchRef"
    v-model="search"
    class="h-8 w-full cursor-pointer rounded-full border border-blue-700 bg-gray-100 px-4 pb-0 pt-px text-gray-700 outline-none transition focus:border-blue-400"
    :class="{ 'border-red-500 border-2': listening }" // [!code ++]
    autocomplete="off"
    name="search"
    placeholder="Search"
    type="search"
    @keyup.esc="search = null"
/>
<button @click="startVoiceRecognition"                 
        :class="{ // [!code ++]
            'text-red-500': listening, // [!code ++]
            'listening': !listening, // [!code ++]
        }" // [!code ++]
>
    Click to start voice recognition!
</button>

// this maintains the styles of the button when it's active
<style scoped>
  .listening:active {
    @apply text-red-500;
  }
</style>
```

Please add your own styles as you see fit. I'm using [Tailwind.css](https://tailwindcss.com/) classes here. In my application,
I also used an SVG inside the button to apply the styles to. This article should just give a basic outline of how to add the styles.

I also have used [InertiaJs](https://inertiajs.com/) in my application, so you may have to adjust the `searchMethod`
method to fit how your application.

Here is the entire component with the SpeechRecognition API added:

```vue
<template>
  <div class="w-full px-2 bg-transparent flex">
    <label for="search" class="hidden">Search</label>
    <input
        id="search"
        ref="searchRef"
        v-model="search"
        class="h-8 w-full cursor-pointer rounded-full border border-blue-700 bg-gray-100 px-4 pb-0 pt-px text-gray-700 outline-none transition focus:border-blue-400"
        :class="{ 'border-red-500 border-2': listening }"
        autocomplete="off"
        name="search"
        placeholder="Search"
        type="search"
        @keyup.esc="search = null"
    />
    <button @click="startVoiceRecognition"
            :class="{ 
            'text-red-500': listening, 
            'listening': !listening,
        }"
    >
        Click to start voice recognition!
    </button>
  </div>
</template>

<script setup>
  import { ref, watch } from "vue";
  import { Inertia } from '@inertiajs/inertia';

  const props = defineProps({
    routeName: {
      type: String,
      required: true,
    },
  });

  let search = ref();
  let listening = ref(false);
  let searchRef = ref(null);

  watch(search, () => {
    if (search.value) {
      searchMethod();
    } else {
      Inertia.get(route(props.routeName));
    }
  });

  const searchMethod = _.debounce(function () {
    Inertia.get(
        route(props.routeName),
        { search: search.value },
        { preserveState: true }
    );
  }, 2000);

  const startVoiceRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
    recognition.interimResults = true;

    recognition.addEventListener("result", (event) => {
      let transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

      if (event.results[0].isFinal) {
        // Split the transcript into words, remove duplicates, and join back together
        transcript = [...new Set(transcript.split(" "))].join(" ");
        search.value = transcript;
      }
    });

    // keep the voice active state in sync with the recognition state
    recognition.addEventListener("start", () => {
      voiceActive.value = true;
    });

    recognition.addEventListener("end", () => {
      voiceActive.value = false;
    });

    recognition.start();
  };
</script>

<style scoped>
  .listening:active {
    @apply text-red-500;
  }
</style>
```

## Conclusion
At this point you should have a working search input in your page which listens for speech when the button is clicked,
then automatically updates the search input with the spoken words, when speech has been recognized.

I have certainly been enjoying how fast I can code out my ideas using VueJs and Tailwind as a starting point for my applications.
I can reuse this component in any of my applications and it will work just fine. I hope you find this useful too.


Happy coding!
