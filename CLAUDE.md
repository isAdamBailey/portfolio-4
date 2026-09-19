# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Adam Bailey's personal blog and portfolio, served at https://adambailey.io. It's a [VitePress](https://vitepress.dev/) static site with the default theme. The only dependency is `vitepress`.

## Commands

Run these from the repo root. The VitePress source root is `blog/`, not the repo root.

```bash
npm run blog:dev      # dev server
npm run blog:build    # static build to blog/.vitepress/dist
npm run blog:preview  # serve the built site
```

There are no tests and no linter. `npm run blog:build` is the only check, and it catches broken YAML frontmatter. It doesn't catch dead links, because `ignoreDeadLinks: true` is set. Deployment is through Laravel Forge: the web server points at `blog/.vitepress/dist`.

## Structure

- `blog/index.md`: the home page. It renders `components/ArticleCard.vue` once for each post returned by `blog/blog.data.mjs`.
- `blog/blog.data.mjs`: a VitePress content loader over `blog/*.md`. It sorts posts by frontmatter `date`, newest first, and **drops any post without `featured: true`**.
- `blog/blog/*.md`: the articles. The file name is the URL slug (`cleanUrls: true`).
- `blog/about.md`: a `layout: home` page. The side projects are the `features:` list in its frontmatter (`link` / `title` / `details`). Each `details:` value is on a single line.
- `blog/.vitepress/config.mjs`: the site config. `transformPageData` adds the canonical URL, Open Graph and Twitter meta, and a JSON-LD Person entry to every page. The OG image comes from frontmatter `image` (or `ogImage`) and falls back to `/logo-og.png`. Google Analytics is added only when `NODE_ENV=production`.
- `blog/.vitepress/theme/`: the default theme plus `custom.css`, which only sets the brand color.
- `blog/public/`: static assets served from `/`.

## Adding an article

**Creating the markdown file isn't enough.** The sidebar doesn't pick up new files, so every new article must also be added to it by hand. A new post needs changes in two places:

1. **`blog/blog/<slug>.md`** with this frontmatter:
   ```yaml
   ---
   title: "..."
   date: YYYY-MM-DD
   description: "..."   # shown on the home page card and used as the OG description
   image: /logo-og.png
   featured: true       # required, or the post won't appear on the home page
   ---
   ```
   Existing posts start the body with an `# H1` that repeats the title.
2. **The Articles sidebar in `blog/.vitepress/config.mjs`.** It's a hand-written list, not generated, so add the new post as the **first** item (the list is newest first).

## Writing voice

Articles are in Adam's first-person voice: plain, short paragraphs, mildly self-deprecating, addressing the reader directly, with `##` headings that say what happens next, and a short sign-off such as "Enjoy!" or "Happy coding!". The earliest posts are the best reference for tone (`run-consecutive-tests.md`, `laravel-new-github-repo.md`). Avoid buzzwords, em-dash-heavy sentences, "not just X, but Y" phrasing, and bulleted recaps of what the post just said. Don't invent specifics about Adam's projects or experiences. Take them from the project's repo or ask him.
