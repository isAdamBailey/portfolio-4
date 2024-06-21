---
title: Laravel Jetstream Search Input
date: 2023-12-28
description: A simple search input for Laravel Jetstream and Inertia.
featured: true
---
# Laravel Jetstream Search Input
A simple search input for Laravel Jetstream and Inertia.

I recently needed to incorporate search functionality on a Laravel Jetstream application using Inertia.
This post outlines how I did that.

## What is Laravel Jetstream?

> [Laravel Jetstream](https://jetstream.laravel.com/):
>
> Laravel Jetstream is a beautifully designed application starter kit for Laravel and provides the perfect
> starting point for your next Laravel application. Jetstream provides the implementation for your application's login,
> registration, email verification, two-factor authentication, session management, API via Laravel Sanctum,
> and optional team management features.

I really love using [Laravel](https://laravel.com/) to develop my applications, and for me, this was a no-brainer.
Jetstream comes packed full of features I won't have to implement or worry about. These features already come with
tests, so I can ensure im not breaking them as I go. I can build whatever I want inside it and use the pre-implemented
components as I go. I am able to move pretty fast inside this architecture.

I chose to use the [Inertia](https://jetstream.laravel.com/2.x/stacks/inertia.html) stack. I really love using
[Vue.js](https://vuejs.org/) so this was also a very easy decision for me. When you choose this stack, it also comes
with a whole range of Vue components that you can reuse throughout building your app.

However, one component that it did not come with was a search input for searching models.

*I'm going to assume you already have a working instance of Laravel Jetstream working locally, and we'll start from there.*

## The Basic Controller

Let's say you want to fetch a list of stories from the database. You have a route like this:

```php
Route::get('/stories', [StoryController::class, 'index'])->name('stories.index');
```

and a controller method iin `StoryController` called `index` which looks like this, to get your stories and render
them via Inertia to a page in Vue:

```php
    public function index(Request $request): Response
    {
        return Inertia::render('Stories', [
            'stories' => Story::paginate(),
        ]);
    }
```

## The Basic Vue Page

Then on the Vue side, you receive the stories from the backend via a `stories` prop to this basic template:

```vue
<template>
    <app-layout>
        <template #header> Stories </template>

        <div class="flex justify-between items-center">
            <div class="text-3xl">Stories</div>
        </div>

        <div v-if="stories.data.length">
          <ul>
            <li v-for="(story, index) in stories.data" :key="index">
              <span>{{ story.title }}</span>
            </li>
          </ul>
        </div>

        <div v-else class="text-gray-500">No stories were found.</div>
    </app-layout>
</template>

<script setup>
    import AppLayout from "@/Layouts/AppLayout.vue";
    
    defineProps({
        stories: {
          type: Object,
          default: () => ({}),
        }
    });
</script>
```

Nothing fancy here. It's just going to return 15 stories if you have them, and this doesn't even give you a way to
paginate to the next page. But its enough to work with for the purposes of this blog post.

## New Search Input Component

We're going to make a new Vue component, just put it in a `Components` directory.

Here's the entire component:

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
    routeName: {
        type: String,
        required: true,
    },
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
- Method that uses lodash `debounce` to only fetch results every 500 milliseconds.

## Incorporate Vue Search Component

Use the new component in the header of your `Stories` page like so:

```html
<div class="flex justify-between items-center">
    <div class="font-header text-3xl md:text-5xl">Stories</div>
    <search-input route-name="stories.index" /> <!-- [tl! add] -->
</div>
```

And into the `script` area:

```vue
<script setup>
    import AppLayout from "@/Layouts/AppLayout.vue";
    // add below line to import component
    import SearchInput from "@/Components/SearchInput.vue"; // [tl! add]
    
    defineProps({
        stories: {
            type: Object,
            default: () => ({}),
        },
    });
</script>
```

## Set Up Backend to Accept and Return Search

Since we don't yet have anything in our controller to receive the search value, nor do we have the inertia prop available
to us in vue, we need to make some changes to the `StoriesController.index` method.

Here is the updated controller with everything we need:

```php
    public function index(Request $request): Response
    {
        // get our search value from the request here:
        $search = $request->search;

        $stories = Story::query()
            // when we have a search value, see if it matches anything in the title or content of the story:
            ->when($search,
                fn ($query) => $query->where('title', 'LIKE', '%'.$search.'%')
                    ->orWhere('content', 'LIKE', '%'.$search.'%')
            )
            ->paginate();

        return Inertia::render('Stories', [
            'stories' => $stories,
            // and return the search value as a page prop to inertia/vue.
            // This is the value we watch in the data() property of the SearchInput.vue component.
            'search' => $search,
        ]);
    }
```

## Conclusion
At this point you should have a working search input in your page which automatically starts searching your
model as you type into the input. Hopefully you are able to understand this concept enough to incorporate it into
your application.

You should be able to reuse this component for any pages in your app that return an `index` route.
You just simply change the `routeName` prop, then set up the backend logic to process the search and return its value:

```php
Route::get('/whatevers', [WhateverController::class, 'index'])->name('whatevers.index');
```

```php
// in WhateverController.index
$search = $request->search;

// query search LIKE %whatever blah blah%
$whatevers = Whatever::query()->when($search, fn ($query) => $query->where('something', 'LIKE', '%'.$search.'%'));

// return it all
return Inertia::render('Whatevers', [
    'whatevers' => $whatevers,
    'search' => $search,
]);
```

```html
<search-input route-name="whatevers.index" />
```

I have certainly been enjoying how fast I can code out my ideas using Laravel Jetstream as a starting point for an app.

Hopefully this adds some value to your experience!

You may also find my article outlining how to apply the SpeechRecognition API to this component useful.
Please see [VueJs Search Input With SpeechRecognition API](/blog/vue-search-input-speech-recognition).


Happy coding!
