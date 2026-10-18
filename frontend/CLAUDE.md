@AGENTS.md

# TGFC frontend ("The Greatest Film Club")

Clubs of users create movie nights, add movies (from TMDB, via the backend) and vote on them.
This is the Next.js frontend; it is a thin UI over a separate FastAPI backend in `../backend`
(Postgres via `../compose.yaml`, deployed together through `../vercel.json` as two Vercel services).

## Stack

- **Next.js 16** (App Router, React 19, Server Components by default). Read `node_modules/next/dist/docs/` before using unfamiliar APIs. Things that differ from older Next:
  - Middleware is `proxy.ts` (exports `proxy`), not `middleware.ts`.
  - `params` is a Promise: `const params = await props.params`.
  - Pages/layouts are typed with the global helpers `PageProps<"/route/[param]">` and `LayoutProps<"/">` (no import needed).
  - Cache invalidation uses `updateTag()` from `next/cache` with fetch `next: { tags: [...] }`.
- **Auth.js / next-auth v5 beta** — Credentials provider, JWT session strategy.
- **Zod v4** (`z.flattenError`, `{ error: "..." }` messages — not v3 `errorMap`/`.flatten()`).
- **Tailwind CSS v4** (config lives in CSS: `src/app/globals.css`, no `tailwind.config`).
- **shadcn/ui** (style `radix-maia`, base color taupe) built on the unified `radix-ui` package; `cn` comes from the `cn` package (`@/lib/utils` re-exports it). Icons: `lucide-react` (`@hugeicons/*` and `@base-ui/react` are installed but essentially unused).
- **sonner** for toasts (`<Toaster>` mounted in the root layout), **@vercel/blob** for avatar uploads.
- Package manager: **pnpm**. Scripts: `pnpm dev`, `pnpm build`, `pnpm lint`. No test suite.

## Layout

```
auth.ts              NextAuth config (root, NOT under src) — exports handlers, signIn, signOut, auth
proxy.ts             Re-exports auth as the Next proxy (route protection)
next-auth.d.ts       Session/User/JWT type augmentation (id, username, accessToken, expires_at)
src/
  app/
    (authenticated)/     Route group; layout calls auth() and redirects to /login, renders <Header>
      page.tsx           Home
      clubs/             /clubs (list + invites), /clubs/create, /clubs/view/[name]/...
        view/[name]/movie-nights/[title]/   movie night page (movies list + add movie)
      profile/[username]/
    (not-authenticated)/ login/, register/ (client pages using useActionState)
    actions/             ALL backend calls live here as "use server" functions, one file per domain
                         (auth, club, movie-night, movie, user)
    api/auth/[...nextauth]/  NextAuth route handlers
    api/avatar/upload/       Vercel Blob client-upload token endpoint
  components/
    ui/                  shadcn generated primitives — add via the shadcn CLI, avoid hand-editing
    <feature>/           feature components: club/, movie/, add-movie/, profile/, header/, auth/
  schemas/               Zod schemas + inferred types for every backend payload (<domain>-schemas.ts)
  lib/auth.ts            authenticatedFetch()
  lib/common.ts          API_URL, redirectToLogin()
  types/                 misc shared types
```

Import alias: `@/*` → `src/*`. The root `auth.ts` is imported as `@/../auth`.
The top-level `components/` folder (outside `src`) is empty — put components in `src/components`.

## Data flow / conventions

- **Backend access**: always go through `authenticatedFetch(path, init)` in `src/lib/auth.ts`. It decodes the Auth.js session cookie, attaches `Authorization: Bearer <backend access token>`, prefixes `API_URL`, and redirects to `/login` on 401. Only the login/register calls use plain `fetch`.
- `API_URL` = `BACKEND_INTERNAL_URL` (Vercel service binding in prod) ?? `API_URL` (`.env` locally).
- **Server actions** (`src/app/actions/*.ts`) are used both for reads (called directly from async Server Components) and mutations (forms). Pattern:
  1. `authenticatedFetch(...)`
  2. on `!res.ok`: map known status codes (404 → `null`/`[]`, 409/403/400 → user-facing error) else `console.error` + throw
  3. parse the JSON with the matching Zod schema from `src/schemas` and return the typed result
  - Mutations used with forms take `(prevState, formData)` and return a state object (`{ success/error, message?, errors?: fieldErrors }`); exported `XxxActionState` types live next to the action.
  - Redirect after create with `redirect(...)`; invalidate cached reads with `updateTag(tag)`.
- **Forms**: client components with `useActionState(action, initialState)`, shadcn `Field*` components for layout/errors, `toast` in a `useEffect` on `state.message`. Pass extra args via `action.bind(null, id)` or hidden inputs.
- **Pages**: async Server Components that `await props.params` (already URL-decoded by Next — don't `decodeURIComponent` again, it throws on titles containing `%`), fetch via actions, `notFound()` when missing, and wrap slower sections in `<Suspense>`.
- **URLs use normalized slugs**: clubs are routed by `normalized_name`, movie nights by `normalized_title` (backend-generated). Build links with `encodeURIComponent(club.normalized_name)`.
- Club membership/permissions come back on `club.member` (`role`: member | admin | owner, `status`: active | invited); UI gates admin actions on that.
- Components: one default-exported component per file, kebab-case filenames, relative imports for `../ui/*` inside `src/components` and `@/` elsewhere.
- Styling: Tailwind utilities with theme tokens (`bg-accent`, `text-muted-foreground`, `text-primary`); headings use `font-heading` (Playfair Display serif). Page content width is `max-w-3xl lg:max-w-6xl mx-auto`.

## Backend API (for reference, `../backend/routers`)

`/auth` (login form-encoded, register), `/users` (`/me`, `/{username}`, PATCH `/me`),
`/clubs` (create, `/name/{name}`, `/user/`, `/invites`, `/{id}/join`, `/{club_id}/invite/{username}`, `/{club_id}/leave`, `/club/{club_id}/members`),
`/movie-nights` (create, `/search?query=`, `/club/{club_id}`, `/{id}/movies` GET/POST `?movie_id=`).
Check the router file before adding a new call — paths aren't always what you'd guess.

## Env (`.env`, not committed)

`API_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN` (+ other `BLOB_*`), `TMDB_BASE_URL`. Don't print or commit values.
