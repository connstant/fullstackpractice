# Phase 3: Swapping raw fetch for TanStack Query

## What I did

1. **Installed TanStack Query** (`@tanstack/react-query`).
2. **Created a cache for the whole app.** In `main.tsx`, `new QueryClient()` makes
   the cache and `<QueryClientProvider>` makes it available to every component.
3. **Reads now use `useQuery`.** One line replaced the `links` / `loading` / `error`
   state, the `useEffect`, and the try/catch/finally:
   `useQuery({ queryKey: ['links'], queryFn: fetchLinks })`
4. **Writes now use `useMutation`.** POST, PATCH and DELETE each got a mutation.
   After each one succeeds, `invalidateQueries(['links'])` re-fetches the list.
   I no longer edit the list by hand.

My `fetch()` calls didn't change. TanStack Query doesn't send requests. It runs
my fetch functions and manages everything around them.

## Key ideas

**Cache:** a notebook of questions I've asked the server and the answers I got.

| Question (query key) | Last answer (data) |
|---|---|
| `['links']` | the full list |
| `['links', 'react']` | 3 links |
| `['links', 'cooking']` | `[]`, which is a real answer too |

- No entry means I haven't asked that question yet. It doesn't mean the data
  doesn't exist.
- The cache is a **copy** of the last answer and can go out of date. The
  **database** is always the real data.
- Only reads go in the cache. Writes don't.

**Query vs. mutation:**
- **Query** = read (GET). Runs automatically. Checks the cache first, and if the
  answer isn't there, fetches it and stores it.
- **Mutation** = write (POST/PATCH/DELETE). Runs only when I call `.mutate()`.
  It always goes straight to the server and never checks the cache.

**Invalidation** is the link between them:
```
click Save → POST → database changes → invalidate ['links'] → GET /links → cache + UI updated
```
The database doesn't push updates. Invalidation makes the browser ask again.
The typed form text is never put into the list. It's only the POST body, and
the list on screen always comes from the database.

## Why it's better than raw fetch (Phase 2)

| Phase 2: I handled it | Phase 3: TanStack handles it |
|---|---|
| 3 `useState`s + `useEffect` + try/catch/finally | `useQuery` gives `data`, `isPending`, `isError`, `error` |
| Updated the list by hand after each write (`[new, ...links]`, `.filter`, `.map`), guessing what the database looked like | Invalidate and re-fetch, so the list always matches the database |
| Data thrown away when a component unmounts, so "Loading…" every time | Cached: coming back to a page shows data instantly and refreshes in the background |
| Each component fetches its own copy | Components using the same key share one request and one copy |
| No loading state per write | Each mutation has `isPending`, so "Saving…" was one line |
| Errors shown straight away | Failed reads are retried 3 times before showing an error |
| Stale data until a reload | Re-fetches when I switch back to the tab |

## The trade-off

Each write costs one extra GET, for the re-fetch. That's worth it for always
being correct. If I want the instant feel back later, the next step is
**optimistic updates**: put the change into the cache first, and undo it if the
server says no.

## What stayed the same

- `fetch()`, `res.ok` checks, JSON headers: requests work exactly as before.
- Form inputs stay in `useState`. They're UI state, not server data.
