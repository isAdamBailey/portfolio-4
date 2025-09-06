---
title: "Inertia.js Deferred Data: Faster Dashboards in Laravel + Vue"
description: "Speed up admin dashboards using Inertia’s deferred data, caching, and eager loading. Code samples for controllers and Vue components."
image: /logo-og.png
date: 2024-12-26
featured: true
---


# Optimizing Admin Dashboard Load Times with Inertia.js Deferred Loading

When building admin dashboards, we often need to load various data sets that aren't immediately visible to users. In my recent project, I faced this challenge with an admin panel that needed to display user lists, category management, and various statistics.

## What is InertiaJs?

[InertiaJs](https://inertiajs.com/) is a framework for building server-driven single-page apps. It's a great way to build a modern web application. I use it along with [Laravel](https://laravel.com/) and [Vue.js](https://vuejs.org/).

## The Challenge

My admin dashboard needed to show:

- A list of all users for admin management
- A list of all categories for content management
- Various statistics including:
  - Total number of books
  - Total number of pages
  - Books with the most/least pages

Loading all this data at once was causing unnecessary delay in the initial page load. Initial performance metrics showed page loads taking 3-4 seconds, with multiple heavy database queries blocking the response.

## The Solution: Inertia's Deferred Loading

Inertia.js provides a powerful feature called deferred data loading. Here's how I implemented it:

```php
public function show()
{
    return Inertia::render('Dashboard/Index', [
        // Group related user data together
        'userData' => Inertia::defer(fn () => [
            'users' => User::select(['id', 'name', 'email'])->get(), // Select only needed fields
            'userCount' => User::count(),
        ]),
        
        // Cache heavy statistics for 1 hour
        'stats' => Inertia::defer(fn () => Cache::remember('dashboard.stats', 3600, function() {
            return [
                'numberOfBooks' => Book::count(),
                'numberOfPages' => Page::count(),
                'leastPages' => Book::withCount('pages')
                    ->orderBy('pages_count')
                    ->first(['id', 'title', 'pages_count']),
                'mostPages' => Book::withCount('pages')
                    ->orderBy('pages_count', 'desc')
                    ->first(['id', 'title', 'pages_count']),
            ];
        })),
        
        // Eager load relationships to prevent N+1 queries
        'categories' => Inertia::defer(fn () => 
            Category::with(['books' => fn($q) => $q->select(['id', 'category_id', 'title'])])
                ->withCount('books')
                ->get()
        ),
    ]);
}
```

## How It Works

1. The initial page load happens instantly, without waiting for these data sets
2. Once the page is mounted, Inertia makes parallel requests to fetch each deferred data set
3. The data loads progressively, showing loading states until the data arrives

Here's how to handle this in your Vue component:

```vue
// resources/js/Pages/Dashboard/Index.vue   
<template>
  <div>
    <Deferred data="userData">
      <template #fallback>
        <UsersSkeleton /> <!-- Custom skeleton loader component -->
      </template>
      
      <UsersList 
        :users="userData.users"
        :total-users="userData.userCount"
      />
    </Deferred>

    <Deferred data="categories" watch>  <!-- 'watch' prop enables real-time updates -->
      <template #fallback>
        <div class="animate-pulse">Loading categories...</div>
      </template>
      
      <CategoriesForm :categories="categories" />
    </Deferred>
  </div>
</template>

<script setup>
import { Deferred } from '@inertiajs/vue3'
import UsersSkeleton from '@/Components/UsersSkeleton.vue'
import UsersList from '@/Components/UsersList.vue'
import CategoriesForm from '@/Components/CategoriesForm.vue'

// Access deferred data through props
const props = defineProps({
  userData: Object,
  categories: Array,
  stats: Object,
})
</script>
```

## Performance Optimization Tips

1. **Group Related Data**: Combine related data into a single deferred request to reduce HTTP calls
2. **Selective Loading**: Only load data when the component actually needs it
3. **Caching**: Use Laravel's cache for expensive queries that don't need real-time updates
4. **Query Optimization**: 
   - Select only needed fields
   - Eager load relationships to prevent N+1 queries
   - Use database indexes for frequently queried columns
5. **Skeleton Loading**: Create meaningful loading states that match your content layout

## Benefits
- **Faster Initial Page Load**: The page becomes interactive much quicker
- **Better User Experience**: Users see the page structure immediately
- **Progressive Loading**: Data appears as it becomes available
- **Built-in Loading States**: The #fallback slot handles the loading state elegantly

## Results
This approach significantly improved the perceived performance of our admin dashboard. Instead of waiting for all queries to complete before showing anything, users now see the page structure immediately and watch the data populate progressively.

## Key Takeaways
1. Use `Inertia::defer()` for data that isn't immediately needed
2. Provide meaningful loading states with the `#fallback` slot
3. Group related data together in a single deferred load to reduce the number of requests


This pattern has become a go-to solution in my Inertia.js applications for optimizing page load times while maintaining a great user experience.
