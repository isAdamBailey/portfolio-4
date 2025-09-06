---
title: "Laravel Caching: Cache Facade, Drivers, and Redis"
date: 2025-09-06
description: "Practical Laravel caching with the Cache facade, tags, TTLs, and Redis. Copy‑paste snippets to speed up your app."
image: /logo-og.png
featured: true
---
# Laravel Caching Basics
How I use Laravel's cache layer day‑to‑day: quick wins with the `Cache` facade, when to use `remember` vs `rememberForever`, how to bust caches safely, and wiring up Redis.

This is a reference for future me.

## How Caching Improves UX

- Faster first paint and navigation: Serving precomputed data cuts TTFB and reduces spinners.
- Smoother pages: Dashboards, menus, and settings feel instant when the heavy queries are cached.
- Resilient on flaky networks: Short TTLs plus a last‑known‑good fallback keep pages usable.
- Kinder to mobile: Fewer DB calls and less backend work means faster responses and lower battery/data usage.

One simple pattern I like for perceived speed is a small “stale‑while‑revalidate” refresh in the background:

```php
// Show cached data immediately; refresh in the background for next time
$key = 'stats.summary';

$summary = Cache::get($key);

if (! $summary) {
    // Cold start — compute synchronously once
    $summary = Cache::remember($key, 600, fn () => computeStats());
} else {
    // Warm — queue a refresh without blocking the request
    dispatch(function () use ($key) {
        Cache::remember($key, 600, fn () => computeStats());
    })->afterResponse();
}

return $summary;
```

Users see something right away, and the next request gets fresh data. Pair this with explicit invalidation on writes when correctness matters.

## Configure Your Cache Driver

Out of the box, Laravel will default to the `file` driver. For local dev, that's fine. For production, use Redis.

```txt
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

If you prefer to be explicit:

```php
// config/cache.php
return [
    'default' => env('CACHE_DRIVER', 'file'),

    'stores' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => 'cache',
        ],
    ],
];
```

Laravel's Redis client works out of the box; if you don't have Redis running, spin it up with Docker for local dev:

```bash
docker run -p 6379:6379 --name redis -d redis:7
```

## Cache Facade Quick Wins

### Remember with TTL

Cache the result of an expensive query for 10 minutes (600 seconds):

```php
use Illuminate\Support\Facades\Cache;

$posts = Cache::remember('home.posts', 600, function () {
    return Post::query()
        ->latest()
        ->take(10)
        ->get();
});
```

### Remember Forever

For rarely changing reference data:

```php
$countries = Cache::rememberForever('meta.countries', function () {
    return Country::orderBy('name')->get();
});
```

### Get / Put / Has

```php
Cache::put('flags.beta', true, now()->addHour());

if (Cache::has('flags.beta')) {
    // feature flag is on
}

$value = Cache::get('flags.beta', false); // default to false
```

### Pull (get and delete)

```php
$token = Cache::pull('one-time-token');
```

## Busting Cache Safely

Use clear, namespaced keys and invalidate them when the underlying data changes.

```php
// After creating/updating/deleting a post, forget the list cache
Cache::forget('home.posts');
```

For related groups of data, use cache tags (Redis or Memcached only):

```php
// Tagging lets you flush subsets
$post = Cache::tags(['posts'])->remember("post:{$id}", 600, fn () => Post::findOrFail($id));

// When a post changes
Cache::tags(['posts'])->flush();
```

## Per-User or Per-Page Keys

Make keys unique to the user or context:

```php
$key = sprintf('dashboard:%s:widgets', auth()->id());

$widgets = Cache::remember($key, 300, fn () => fetchWidgetsFor(auth()->user()));
```

## Cache in Controllers

```php
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HomeController
{
    public function index()
    {
        $posts = Cache::remember('home.posts', 600, fn () => Post::latest()->take(10)->get());

        return Inertia::render('Home', [
            'posts' => $posts,
        ]);
    }
}
```

## Cache and Eloquent

You generally don't want to hide caching inside your model methods. Keep it at the edge (controllers, actions, queries) so invalidation is explicit. A pattern I like is a small query class:

```php
final class RecentPostsQuery
{
    public static function get(): \Illuminate\Support\Collection
    {
        return Post::query()->latest()->take(10)->get();
    }
}

$posts = Cache::remember('home.posts', 600, [RecentPostsQuery::class, 'get']);
```

## Redis Details

Once `CACHE_DRIVER=redis` is set, Laravel will use your Redis connection. If you need a dedicated connection for caching:

```php
// config/database.php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),

    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => 0,
    ],

    'cache' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => 1,
    ],
],
```

Now your cache store can point at the `cache` connection (as shown earlier).

## Cache Locks (Avoid Duplicate Work)

Use locks to prevent concurrent jobs from doing the same expensive work (Redis only):

```php
// Prevent overlapping report generation
$lock = Cache::lock('reports:monthly:2025-09', 60); // 60s TTL for the lock

if ($lock->get()) {
    try {
        generateMonthlyReport();
    } finally {
        $lock->release();
    }
} else {
    // another worker is already generating this report
}
```

## When Not to Cache

- Highly personalized data with low reuse and fast queries.
- Data that must be strictly consistent for legal/financial reasons.
- Tiny tables already fully in memory via your DB buffer.

## Debugging Tips

```bash
# See keys (dev only)
redis-cli KEYS '*home.posts*'

# Delete a key
redis-cli DEL home.posts

# Flush ONLY the cache database
redis-cli -n 1 FLUSHDB
```

## Conclusion

Keep keys predictable, invalidate aggressively on writes, and prefer short TTLs unless data truly barely changes. Switching to Redis in production is a one‑line `.env` change, and features like tags and locks are worth it.

Happy caching!


