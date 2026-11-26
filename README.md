# Raveno — Review Desk

A complete review management dashboard for a marketplace or a service business, in a black, white and grey look with a light and a dark theme, and it comes with sample data.

## Good for

A team that reads and answers customer reviews, checks the ones that break the rules and keeps track of the people being reviewed.

## How it works

Reviews land in a reply queue; open one and the reply box offers two answers written for that review, and posting one takes it out of the queue and shows the answer under it, while flagging, removing and restoring all come with Undo.

## Includes

- An overview with a reputation score and a year of ratings, the star mix, four figure tiles that each switch the 14-day chart, the reply queue, review sources, the best-rated people and the team's latest replies.
- Insights with ratings by month and by trade, reviews a month against last year, a week-by-hour heatmap and reply times by teammate.
- A directory of the people being reviewed with profile drawers, and an onboarding board whose cards move along as documents are approved.
- Clients with profiles and review requests.
- A document library and a document check queue.
- An inbox.
- Settings with team roles, review rules, notifications and a reset.
- Help.

## How to use

Run it as it is to explore with the sample data, which is saved in your browser, then connect your own reviews API in place of the sample data, since there is no backend. The sidebar folds to icons, `Cmd+K` searches everything, and it works on every screen from phone to desktop with a bottom tab bar on phones.

## Built with

React, TypeScript, GSAP, TanStack Query and Mock Service Worker (MSW). Vite is used for development and production builds.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:3000>.

The dev server binds to `0.0.0.0:3000`. A production build is generated in `dist/` and can be served with `npm run preview`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite on port 3000. |
| `npm run build` | Type-check and create the production bundle in `dist/`. |
| `npm run preview` | Serve the production build on port 3000. |
| `npm run typecheck` | Run `tsc -b` without emitting. |
| `npm run lint` | ESLint with zero warnings allowed. |
| `npm run lint:fix` | Apply ESLint fixes. |
| `npm run check` | Lint, typecheck and build. Run this after edits when `dist/` is what gets served. |

---

## App outline

The app uses hash routing. The default route is `#/overview`.

| Route | What it shows |
| --- | --- |
| `#/overview` | Reputation score, yearly ratings chart, star mix, four switchable 14-day metric tiles, reply queue, review sources, best-rated pros and latest team replies. |
| `#/insights` | Ratings by month and trade, volume versus last year, reply-time and heatmap views. Tabs: `ratings`, `volume`, `response`. |
| `#/reviews/inbox` | The “To reply” queue. Review detail routes are `#/reviews/inbox/<reviewId>`. |
| `#/reviews/flagged` | Held reviews awaiting a moderation decision. |
| `#/reviews/published` | Answered/public reviews. |
| `#/pros/onboarding` | Onboarding board; cards advance as verification documents are approved. |
| `#/pros/directory` | Directory of reviewed people with profile drawers, e.g. `#/pros/directory/p1`. |
| `#/clients` | Client list and profiles, e.g. `#/clients/c1`. |
| `#/documents/library` | Searchable document library with folders, starred files and file actions. |
| `#/documents/verification` | Document check queue for pro verification papers. |
| `#/inbox` | Conversation list. Individual threads use `#/inbox/<threadId>`. |
| `#/settings/profile` | Profile details. |
| `#/settings/team` | Team roles and teammates. |
| `#/settings/rules` | Review rules and switches. |
| `#/settings/notifications` | Notification preferences. |
| `#/settings/data` | Export/reset controls for the sample state. |
| `#/help` | Searchable FAQ accordion and support request form. |

Unknown routes fall back to Overview; sub-tabs default to their first item when omitted.

### Global interactions

- `Cmd/Ctrl + K` opens Finder and searches routes, reviews, pros, clients, documents and actions.
- `/` opens search; `N` opens the New menu.
- `G` then `O`, `I`, `R`, `P`, `C`, `D` or `M` jumps to a top-level route.
- `[` folds/unfolds the sidebar to icons.
- `Esc` closes overlays; `?` opens the keyboard shortcuts dialog.
- Notifications, account, New menu, sign-in, confirmations, drawers and toasts are global overlays.
- Mutating actions keep a full pre-mutation snapshot so Undo restores the complete state.
- The theme uses a circular `document.startViewTransition` reveal where supported.
- Animations respect `prefers-reduced-motion`.

---

## Architecture

There is no server backend. A small fetch API is intercepted by MSW in the browser, and TanStack Query is the only client-side store. Pages read through query hooks; mutations call the fetch API and invalidate the bootstrap query.

```text
UI pages / overlays
        │
        ▼
src/stores/*       query keys, hooks and mutations (no mutable UI store)
        │
        ▼
src/api/client.ts  typed fetch wrapper for /api/*
        │
        ▼
src/mocks/handlers.ts  MSW request handlers
        │
        ▼
src/mocks/db.ts        persisted mock database (localStorage)
```

### Data and configuration

- `GET /api/bootstrap` returns the full application state: `team`, `pros`, `clients`, `reviews`, `docs`, `verifications`, `threads`, `notices`, `history`, `prefs`, `me` and `signedIn`.
- `GET /api/config` returns data-driven options and operation data: palettes, filter lists, templates, FAQ content, folder lists, status labels, invite cities, chart buckets and similar data.
- Static display copy (action labels, menus, shell text) is intentionally kept in the UI for now. i18n/static-copy extraction is planned as a separate pass.

Shared types live in `src/types/*`. `src/data/source.ts` is the generated sample-data seed, and `src/data/config.ts` is the canonical runtime config served by MSW.

### Mock API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | Full app state used by `useBootstrap()`. |
| `GET` | `/api/config` | Runtime config used by `useConfig()`. |
| `GET` | `/api/state` | Raw persisted state. |
| `POST` | `/api/state/restore` | Restore a full snapshot for Undo. |
| `GET`, `POST` | `/api/reviews` | List/create reviews. |
| `PATCH` | `/api/reviews/:id` | Reply, flag, hide, restore, helpful count, etc. |
| `GET`, `POST` | `/api/pros` | List/add pros. |
| `POST` | `/api/pros/:id/advance` | Advance an onboarding step. |
| `POST` | `/api/pros/:id/toggle` | Pause/live toggle. |
| `POST` | `/api/verifications/:id/decide` | Approve/reject a document. |
| `GET` | `/api/documents` | List documents. |
| `DELETE` | `/api/documents/:id` | Delete a document. |
| `POST` | `/api/documents/:id/star` | Toggle star. |
| `POST` | `/api/documents/upload` | Add an uploaded document. |
| `GET`, `POST` | `/api/threads` | List/create inbox threads. |
| `PATCH` | `/api/threads/:id` | Read/unread, archive, subject. |
| `POST` | `/api/threads/:id/messages` | Append a message. |
| `PATCH` | `/api/session` | Sign in/out state. |
| `GET`, `PATCH` | `/api/settings` | Settings and preferences. |
| `POST` | `/api/settings/pros` | Invite a pro. |
| `POST` | `/api/settings/team` | Invite a teammate. |
| `GET`, `POST` | `/api/notices` | List/add notifications. |
| `PATCH` | `/api/notices/:id` | Mark read, etc. |
| `POST` | `/api/demo/reset` | Restore the seed state. |

### Storage keys

| Key | Contents |
| --- | --- |
| `raveno:mock-db:v1` | Persisted MSW mock database. |
| `raveno:tanstack:v1` | Persisted TanStack Query cache. |
| `raveno:theme` | Light/dark/system theme choice. |
| `raveno:rail` | Sidebar folded state. |

Queries use `networkMode: 'offlineFirst'`, long `gcTime`, and a sync localStorage persister so the UI can render from cache when startup fetches are unavailable. Mutations invalidate the bootstrap query. `Settings → Data` and `POST /api/demo/reset` restore the original sample state.

---

## Project structure

```text
raveno/
├─ index.html                  App shell and root element
├─ app.css                     Main source-styled design system and themes
├─ css/                        Page-specific CSS: overview, reviews, pros
├─ public/
│  └─ mockServiceWorker.js     Generated MSW worker (do not delete)
├─ src/
│  ├─ main.tsx                 MSW startup, API prefetch, persistence, root render
│  ├─ App.tsx                  Routing, shell state, live feed, overlays, notices
│  ├─ router.ts                Hash routes, sub-tabs, normalization and navigation
│  ├─ api/
│  │  ├─ client.ts             Typed fetch wrapper for /api/*
│  │  ├─ provider.tsx          PersistQueryClientProvider wrapper
│  │  └─ queryClient.ts        Query defaults and localStorage persister
│  ├─ app/
│  │  ├─ pages.ts              Lazy page module map
│  │  └─ testBridge.ts         window.__app.start() for record-mode harnesses
│  ├─ config/
│  │  └─ navigation.ts         Icon and quick-route maps
│  ├─ data/
│  │  ├─ source.ts             Generated sample-data seed
│  │  └─ config.ts             Canonical runtime config
│  ├─ hooks/                   Hash, theme, clock, toasts, rail, live feed, effects
│  ├─ mocks/
│  │  ├─ browser.ts            MSW browser worker setup
│  │  ├─ db.ts                 Persisted mock DB and snapshot helpers
│  │  └─ handlers.ts           All /api/* request handlers
│  ├─ pages/                   One component per route family
│  ├─ stores/                  Query keys, hooks and mutations per domain
│  ├─ types/                   Centralized domain, API, config, app and UI types
│  └─ ui/
│     ├─ components/           Layout, overlays, primitives, feedback and charts
│     ├─ data/                 Formatting, clocks, notices, live feed, view models
│     └─ motion/               GSAP interactions and page transitions
```

`src/stores/*` are intentionally query-key/hook modules rather than a Zustand or other mutable store. There is no `src/store.ts` compatibility layer.

---

## Sample data and record mode

The bundled sample data is deterministic and is saved in browser storage, so changes survive reloads until you reset them. It covers reviews, pros, clients, documents, verification records, inbox threads, notices and chart history.

Adding `?record=1` to the URL enables the deterministic visual-regression mode:

- persistence and the timed live review feed are disabled;
- `window.__app.start()` is exposed and adds the `is-started` class to `<html>`;
- GSAP animations still run, including the theme transition.

Example:

```text
http://127.0.0.1:3000/?record=1#/overview
```

---

## Connecting a real API

1. Implement the endpoints listed in the **Mock API endpoints** table, or adapt the response shapes in `src/types/*` and the hooks in `src/stores/*`.
2. Change `BASE` in `src/api/client.ts` from `/api` to your API root.
3. Remove or gate `startMockBackend()` in `src/main.tsx`; do not ship `public/mockServiceWorker.js` as the active request layer.
4. Serve `GET /api/bootstrap` and `GET /api/config` first — the UI prefetches both before rendering.
5. Keep full-state snapshots in mutation responses if you want the existing Undo behavior.

The UI reads domain data from the API/config. Static labels and marketing copy remain in components and can be extracted later during an i18n pass.

---

## Verification notes

Run `npm run check` after code changes. The production preview/static server serves `dist/`, so a build is required before browser verification.

A typical verification pass covers:

- all hash routes and sub-tabs;
- Finder results, keyboard shortcuts and the New menu;
- reply, flag, hide and restore flows with Undo;
- pro onboarding and verification decisions;
- document upload, star, delete and Undo;
- theme switching, sidebar folding and responsive tab bar;
- notification state and sign-out/sign-in;
- persistence across reload and reset back to seed data.
