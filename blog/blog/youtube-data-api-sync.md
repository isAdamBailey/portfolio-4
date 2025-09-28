---
title: "How to Use the YouTube Data API in Laravel: Fetch Playlist Videos, Save to Database, and Handle Quota"
date: 2025-09-28
description: "Learn how to use the YouTube Data API in Laravel to fetch playlist videos, save them to your database, and manage rate limits and quota. Practical PHP code and SEO best practices."
image: /logo-og.png
featured: true
---

# How to Use the YouTube Data API in Laravel: Fetch Playlist Videos, Save to Database, and Handle Quota

What I did to automate YouTube video sync for my Laravel app, and what tripped me up along the way.

I wanted my Laravel app to always have the latest videos from a YouTube playlist, without manual copy-paste. Here’s how I wired up the YouTube Data API, saved videos to my database, and handled all the weird quota and rate limit stuff Google throws at you.

## Prerequisites
- Laravel 8+ installed
- Google Cloud project with YouTube Data API v3 enabled
- API key (store in `.env` as YOUTUBE_API_KEY)
- Database (MySQL, PostgreSQL, etc.)

## Step 1: Set Up Laravel for YouTube API
First, add your API key to `.env`:

```
YOUTUBE_API_KEY=your_api_key_here
```

Access it in code with `config('services.youtube.key')` or `env('YOUTUBE_API_KEY')`.

Add this to `config/services.php`:

```php
'youtube' => [
    'key' => env('YOUTUBE_API_KEY'),
],
```

## Step 2: Create a Video Model and Migration
Run:

```
php artisan make:model Video -m
```

Edit the migration (database/migrations/xxxx_create_videos_table.php):

```php
Schema::create('videos', function (Blueprint $table) {
    $table->id();
    $table->string('youtube_id')->unique();
    $table->string('title');
    $table->string('duration')->nullable();
    $table->unsignedBigInteger('views')->default(0);
    $table->json('tags')->nullable();
    $table->timestamps();
});
```

Run the migration:

```
php artisan migrate
```

## Step 3: Fetch Playlist Videos with Laravel’s HTTP Client
Use Laravel’s built-in HTTP client (no Guzzle needed):

```php
use Illuminate\Support\Facades\Http;

$apiKey = config('services.youtube.key');
$playlistId = 'YOUR_PLAYLIST_ID';
$baseUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';

$params = [
    'part' => 'snippet',
    'maxResults' => 50,
    'playlistId' => $playlistId,
    'key' => $apiKey,
];

$response = Http::get($baseUrl, $params);
$items = $response->json('items') ?? [];
```

**Gotcha:** Use `$response->json()` not `$response['items']`.

## Step 4: Get Video Details and Save to Database
Batch up to 50 video IDs per call:

```php
$videoIds = collect($items)->map(fn($item) => $item['snippet']['resourceId']['videoId'])->implode(',');
$detailsResponse = Http::get('https://www.googleapis.com/youtube/v3/videos', [
    'part' => 'contentDetails,statistics,snippet',
    'id' => $videoIds,
    'key' => $apiKey,
]);
$videoDetails = $detailsResponse->json('items') ?? [];

foreach ($videoDetails as $video) {
    \App\Models\Video::updateOrCreate(
        ['youtube_id' => $video['id']],
        [
            'title' => $video['snippet']['title'] ?? 'Untitled',
            'duration' => $video['contentDetails']['duration'] ?? null,
            'views' => $video['statistics']['viewCount'] ?? 0,
            'tags' => json_encode($video['snippet']['tags'] ?? []),
        ]
    );
}
```

**Gotcha:** Use `updateOrCreate` to avoid duplicates. Always check for missing fields.

## Step 5: Where to Put the Sync Logic
- For manual runs: use an Artisan command (`php artisan make:command SyncYoutubeVideos`)
- For scheduled sync: add to `app/Console/Kernel.php` as a scheduled job
- For big playlists: use Laravel queues to batch requests and avoid timeouts

## Step 6: Handle Rate Limiting and Quota in Laravel
- Add `usleep(200000)` between batches
- Catch exceptions with try/catch and log errors
- Use Laravel’s retry helper for transient errors:

```php
$response = retry(3, fn() => Http::get($baseUrl, $params), 200);
```

**Fallback:** If you hit quota, log it and alert yourself (email, Slack, etc). For big jobs, consider chunking requests and running overnight.

## Debugging & Manual Checks
- Log all API responses for troubleshooting
- Use Laravel’s `Log` facade for errors
- Double-check your database for missing or duplicate videos

## More Resources
- [YouTube Data API documentation](https://developers.google.com/youtube/v3/docs)
- [Laravel HTTP Client](https://laravel.com/docs/10.x/http-client)

## Summary
Automating YouTube video sync in Laravel keeps your app up-to-date and saves manual work. Use models, migrations, jobs, and queues for a robust solution. Watch out for quota, missing fields, and pagination. Log everything, use defaults, and check your work. For more API tips, check out my other articles.
