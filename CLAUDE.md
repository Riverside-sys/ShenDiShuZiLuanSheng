# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev` (Vite serves on `http://localhost:8889`)
- Production build: `pnpm build`
- Preview built app: `pnpm preview`
- Windows convenience script: `start.bat`

## Tooling and environment

- Package manager: `pnpm`
- Recommended Node version from README: `Node 22`
- Vite config is in `vite.config.ts`
- Path alias: `@` -> `src` (`tsconfig.json`)
- Router uses hash history (`createWebHashHistory`), so routes are `#/surface`, `#/panyidong`, etc.
- There is currently no dedicated lint or test script in `package.json`; do not assume ESLint, Vitest, or single-test commands exist until you add/configure them.

## High-level architecture

This is a Vue 3 + Vite + TypeScript digital-twin visualization app centered on Cesium scenes. The app has one shared shell and three main scene routes:

- `surface`: top-level overview map that flies between demonstration areas and links into underground scenes
- `panyidong`: underground mine scene, with a nested subscene route for Gaussian splat roadway data
- `hanshuiceng`: underground aquifer scene

### App shell and boot flow

- `src/main.ts` creates the Vue app, calls `setupPlugins`, then installs Pinia and Vue Router.
- `src/utils/plugins.ts` is the global registration point for Element Plus, Ant Design Vue, animate.css, shared CSS, and custom directives.
- `src/App.vue` provides the persistent layout shell: global header on top, current route below.
- `src/components/header/index.vue` owns top navigation and scene switching between the three main routes.

### Routing model

- `src/router/index.ts` assembles routes from `src/router/modules/*.ts` and redirects `/` -> `/home` -> `/surface`.
- Route modules are scene-oriented rather than feature-oriented.
- `panyidong` is the only route with an active nested child route today: `subscenes/mines_roadway_gsplat`.
- A global `beforeEach` toggles animation state through the Pinia animate store during route transitions.

### Scene organization

Each major scene lives under `src/Views/<scene>/` and is largely self-contained:

- `index.vue`: scene entry component
- `components/`: scene-specific HUD panels, toolbars, footers, and popups
- `data/`: asset entrypoints that export Vite `?url` references for models/media
- `utils/`: scene-specific Cesium helpers when needed
- `subscenes/`: nested visualizations under a scene

This repo prefers keeping route-specific assets and logic inside the corresponding scene directory instead of centralizing everything under shared folders.

### Cesium usage patterns

- `surface` initializes a globe-style Cesium viewer and overlays GeoJSON/KML datasets to highlight demo areas.
- `panyidong` and `hanshuiceng` initialize standalone Cesium viewers as full-screen 3D canvases with custom UI overlays layered above them.
- Underground scenes scale a fixed 1920x1080 HUD layer to the actual viewport instead of relying on fully fluid layouts.
- Cesium viewers are typically created inside the scene component and destroyed on unmount rather than being shared through a central service.

### Data and asset conventions

- Scene data modules such as `src/Views/surface/data/index.ts`, `src/Views/panyidong/data/index.ts`, and `src/Views/hanshuiceng/data/index.ts` are the canonical import points for local models, videos, GIFs, KML, and GeoJSON.
- These files expose asset URLs via Vite `?url` imports; when wiring new media, follow the same pattern instead of hardcoding string paths.
- README notes that large local assets are intentionally not committed. In particular, `src/Views/panyidong/data/` and `src/Views/hanshuiceng/data/` require local model/media files to exist beyond the checked-in `index.ts` mapping files.
- If a scene loads but media/model requests fail, check missing local data before changing code.

### State and shared utilities

- Pinia stores live in `src/stores/`; `src/stores/animate.ts` is currently part of the route transition flow.
- Shared utilities live in `src/utils/`; shared hooks in `src/hooks/`; global styles in `src/styles/`.
- Prefer adding shared logic there only when it is truly cross-scene. Most visualization behavior in this repo is scene-local.

## Important repo-specific notes

- Vite is configured with `vite-plugin-cesium`; keep Cesium-related build behavior aligned with that plugin.
- `vite.config.ts` treats tags beginning with `ion-` as custom elements.
- Cursor rules in `.cursor/rules/` are mostly generic, but the relevant repo-level takeaways are: keep changes minimal and scoped, prefer TypeScript/Vue Composition API patterns, and keep Vite/Vue/Tailwind-era conventions in mind when editing frontend code.
- One scene currently includes an in-file Cesium Ion token in `src/Views/surface/index.vue`; treat any work around Cesium credentials carefully and avoid spreading credential usage further.
