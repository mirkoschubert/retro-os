# retro-os

Personal portfolio of Mirko Schubert, running on [mirkoschubert.de](https://mirkoschubert.de) (German) and [mirkoschubert.com](https://mirkoschubert.com) (English).

A single SvelteKit app delivered on two domains. The domain is the primary language signal - no separate deployments, no URL prefixes.

The interface is a fictional dark retro creative system inspired by Mac System 7, Amiga Workbench, and NeXTSTEP - not a 1:1 recreation, but a reinterpretation as a usable portfolio shell. Content areas appear as programs/modules inside a windowed desktop environment.

## Stack

- **Framework:** SvelteKit + Svelte 5 (runes)
- **Styling:** CSS custom properties, no UI framework
- **i18n:** inlang/paraglide-js (compile-time, domain-based)
- **CMS:** Sanity Studio (monorepo workspace at `studio/`)
- **Analytics:** Umami (self-hosted, privacy-respecting)
- **PWA:** vite-plugin-pwa + Workbox
- **Hosting:** Vercel

## Setup

```sh
pnpm install
```

Copy `.env.example` to `.env` and fill in the required values:

```sh
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `PUBLIC_UMAMI_SRC_URL` | Umami script URL |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami website ID |

## Development

```sh
pnpm dev
```

The app runs on `localhost`. Language detection falls back to browser language when running locally (not domain-based).

To also run the Sanity Studio:

```sh
# in studio/
pnpm dev
```

The studio is a separate pnpm workspace package and has its own `package.json`.

## Build

```sh
pnpm build
pnpm preview
```

Deployed automatically via Vercel on push to `main`.

## Architecture

The app is structured in three layers:

- **Shell layer** - global layout, menubar, dock, command palette, window manager (`src/lib/stores/wm.svelte.ts`)
- **Program layer** - individual modules (ProjectBrowser, MediaPlayer, Darkroom, Writer, SysInfo, Archive) in `src/lib/components/modules/`
- **Content layer** - Sanity queries and locale-aware data fetching in `src/lib/sanity/`

Modules are opened via `openModule(id)` in `src/routes/+page.svelte`, which creates a managed window entry in the window store. Each opened module fires a `module-open` analytics event.

## License

MIT - see [LICENSE](LICENSE)
