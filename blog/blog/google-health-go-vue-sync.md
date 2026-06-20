---
title: "Syncing Weight and Height Data with the Google Health API in Go and Vue"
date: 2026-06-20
description: "How I integrated the Google Health API into a Go backend and Nuxt/Vue frontend to sync weight and height entries, with encrypted OAuth credential storage."
image: /logo-og.png
featured: true
---

# Syncing Weight and Height Data with the Google Health API in Go and Vue

I built [Massa](https://github.com/isAdamBailey/massa), a small weight/BMI tracker, and wanted it to stay in sync with Google Health instead of being yet another place to log numbers by hand. Here's how the integration came together on a Go backend and a Nuxt/Vue frontend.

## The Shape of the Problem

Three things needed to happen:

1. Let a user connect their Google account via OAuth, scoped to health metrics.
2. Store the resulting tokens somewhere safe.
3. Pull weight and height history from Google's API and merge it into the local database without creating duplicates.

## OAuth Config

The OAuth setup is just the standard `golang.org/x/oauth2` config, scoped to read and write health metrics:

```go
var Scopes = []string{
    "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
    "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.writeonly",
}

func OAuthConfig(cfg config.GoogleOAuthConfig) *oauth2.Config {
    return &oauth2.Config{
        ClientID:     cfg.ClientID,
        ClientSecret: cfg.ClientSecret,
        RedirectURL:  cfg.RedirectURL,
        Scopes:       Scopes,
        Endpoint:     google.Endpoint,
    }
}
```

Google OAuth is entirely optional in this app — it's only wired up if a client ID, secret, and encryption key are all present in the environment. That keeps local dev simple when you don't want to deal with Google credentials at all.

## Encrypting Tokens at Rest

Refresh and access tokens are sensitive, so they're encrypted with AES-256-GCM before they ever touch Postgres:

```go
func Encrypt(key, plaintext []byte) (ciphertext, nonce []byte, err error) {
    gcm, err := newGCM(key)
    if err != nil {
        return nil, nil, err
    }

    nonce = make([]byte, gcm.NonceSize())
    if _, err := rand.Read(nonce); err != nil {
        return nil, nil, fmt.Errorf("generate nonce: %w", err)
    }

    return gcm.Seal(nil, nonce, plaintext, nil), nonce, nil
}
```

The nonce gets stored alongside the ciphertext. A `CredentialsRepository` interface wraps the encrypt/decrypt calls so the rest of the codebase just deals with plain `Credentials` structs and never touches raw bytes.

## Backfilling History

The interesting part is the sync itself. `BackfillService.Run` authorizes a client, pulls the user's full height and weight history page by page, and upserts each data point:

```go
func (s *BackfillService) syncWeight(ctx context.Context, client *Client, userID uuid.UUID, healthUserID string) error {
    heightCm, err := s.heights.Resolve(ctx, userID)
    if errors.Is(err, heights.ErrNoHeight) {
        heightCm = 0
    } else if err != nil {
        return fmt.Errorf("resolve height: %w", err)
    }

    pageToken := ""
    for {
        resp, err := client.ListWeightDataPoints(ctx, healthUserID, pageToken)
        if err != nil {
            return err
        }

        for _, dp := range resp.DataPoints {
            // convert grams to kg, compute BMI, upsert...
        }

        if resp.NextPageToken == "" {
            return nil
        }
        pageToken = resp.NextPageToken
    }
}
```

BMI is computed once, at sync time, using whatever height is resolvable at that moment — never recalculated retroactively. That keeps historical entries stable even if the user's height changes later.

**Gotcha:** Google data points don't always include a stable ID. When they do, entries are upserted by `google_data_point_id`; when they don't, the database falls back to a unique constraint on `(user_id, recorded_at)` so re-running a backfill never creates duplicates.

## The Vue Side

The frontend doesn't talk to Google directly — it just drives the backend's OAuth flow and shows status. A small Pinia store handles it:

```ts
async function connect() {
  error.value = null
  try {
    const { url } = await apiFetch<{ url: string }>('/api/google/auth-url')
    window.location.href = url
  } catch {
    error.value = 'Failed to start Google connection. Please try again.'
  }
}

async function sync() {
  syncing.value = true
  error.value = null
  try {
    await apiFetch('/api/google/sync', { method: 'POST' })
    await fetchStatus()
  } catch {
    error.value = 'Sync failed. Please try again.'
  } finally {
    syncing.value = false
  }
}
```

The settings page renders connect/disconnect/sync buttons off `status.connected`, and the dashboard shows a small banner with the last sync time. No polling, no websockets — just a fetch-on-demand store like the rest of the app's stores.

## Why Go and Vue Specifically Helped

This integration was built with heavy AI pairing, and the language/framework choices mattered more than I expected.

**Go for AI-assisted code.** Go's small surface area — explicit errors, no hidden control flow, minimal magic — means an AI assistant's suggestions are easy to verify at a glance. The `Querier` interface pattern (each package defines only the DB methods it needs) keeps generated code honest: if a suggested change calls a method outside that interface, the compiler catches it immediately instead of failing silently at runtime. Static typing turned most AI mistakes into compile errors I caught before ever running the code.

**Vue for AI-assisted markup.** Vue's single-file components keep template, script, and style in one place, so an AI suggestion touching a form or button can't quietly drop an accessibility attribute living three files away. Because the template syntax stays close to plain HTML (`<label for>`, `<button>`, `v-bind="aria-*"`) rather than hiding markup behind JSX abstractions, it's easy to spot — and easy for an assistant to generate — correct semantic elements and ARIA attributes on the first pass.

**Accessibility as a side effect, not a checklist.** The connect/disconnect/sync controls on the settings page are plain `<button>` elements with real `disabled` and loading states bound to the store, not divs with click handlers. Go's straightforward JSON responses meant the frontend never had to reshape awkward data just to render status text, so the markup describing "connected" or "last synced at" stayed simple enough to keep accessible without extra effort.

## What I'd Tell Past Me

- Decide on the encryption story before you store a single token. Retrofitting encryption onto plaintext columns is a much worse afternoon.
- Dedupe at the database layer, not in application code. A unique index is cheaper to reason about than a "have I seen this before" check in Go.
- Keep the OAuth integration fully optional behind config. It made local development and testing painless — no real Google credentials needed to run the rest of the app.

## Wrap-up

Wiring a third-party health API into a side project sounds bigger than it is once you separate the pieces: auth config, encrypted storage, a paginated sync loop, and a thin frontend store to kick it all off. Each piece on its own is small and testable in isolation, which is exactly how it's covered in Massa's test suite.
