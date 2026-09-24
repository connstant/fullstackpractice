import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import './App.css'

type Link = {
  id: number
  url: string
  note: string | null
  tags: string | null
  created_at: string
  is_read: boolean
}

type NewLink = {
  url: string
  note: string | null
  tags: string | null
}

const API_URL = 'http://localhost:8000'

// ① API FUNCTIONS: plain fetch(), same as Phase 2.
//    TanStack Query doesn't make requests for you. It calls these functions
//    and manages the result (loading, error, caching, refetching).
//    Each one throws on a non-2xx response so TanStack Query sees it as an error.

async function fetchLinks(): Promise<Link[]> {
  const res = await fetch(`${API_URL}/links`)
  if (!res.ok) throw new Error(`Server said ${res.status}`)
  return res.json()
}

async function createLink(newLink: NewLink): Promise<Link> {
  const res = await fetch(`${API_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLink),
  })
  if (!res.ok) throw new Error(`Create failed: ${res.status}`)
  return res.json()
}

async function deleteLink(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/links/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  // 204 = no body, so nothing to return
}

async function updateLink(link: Link): Promise<Link> {
  const res = await fetch(`${API_URL}/links/${link.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    // PATCH = only send the field that changed
    body: JSON.stringify({ is_read: !link.is_read }),
  })
  if (!res.ok) throw new Error(`Update failed: ${res.status}`)
  return res.json()
}

function App() {
  // Gives us access to the cache created in main.tsx
  const queryClient = useQueryClient()

  // Form inputs are still local UI state, so they stay as useState
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState('')

  // ② QUERY: replaces useState(links) + useState(loading) + useState(error)
  //    + the whole useEffect. The key ['links'] is the name of this data in
  //    the cache; anything that says "['links'] is stale" makes it refetch.
  const linksQuery = useQuery({
    queryKey: ['links'],
    queryFn: fetchLinks,
  })

  // ③ MUTATIONS: one per write. onSuccess invalidates ['links'], which tells
  //    TanStack Query "the list is out of date, fetch it again". We no longer
  //    splice the list by hand with setLinks([...]).
  const invalidateLinks = () =>
    queryClient.invalidateQueries({ queryKey: ['links'] })

  const createMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      invalidateLinks()
      // Clear the form only once the server has saved it
      setUrl('')
      setNote('')
      setTags('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: invalidateLinks,
  })

  const toggleReadMutation = useMutation({
    mutationFn: updateLink,
    onSuccess: invalidateLinks,
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault() // stop the browser's default "reload the page" on submit
    // `|| null` sends null instead of "" for empty optional fields
    createMutation.mutate({ url, note: note || null, tags: tags || null })
  }

  // Whichever write failed most recently, if any
  const mutationError =
    createMutation.error ?? deleteMutation.error ?? toggleReadMutation.error

  const links = linksQuery.data ?? []

  return (
    <main>
      <h1>Link Saver</h1>

      {/* ④ FORM: same as before, but the button knows when a save is in flight */}
      <form onSubmit={handleCreate}>
        <input
          type="url"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <input
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          placeholder="Tags (optional)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Saving…' : 'Save link'}
        </button>
      </form>

      {/* ⑤ LOADING / ERROR: these flags come from useQuery/useMutation now */}
      {linksQuery.isPending && <p>Loading…</p>}
      {linksQuery.isError && (
        <p style={{ color: 'red' }}>Error: {linksQuery.error.message}</p>
      )}
      {mutationError && (
        <p style={{ color: 'red' }}>Error: {mutationError.message}</p>
      )}

      {linksQuery.isSuccess && links.length === 0 && <p>No links yet.</p>}

      {/* ⑥ LIST: unchanged, but the buttons call mutate() */}
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank">{link.url}</a>
            {link.note && <span> — {link.note}</span>}
            {link.tags && <small> [{link.tags}]</small>}{' '}
            <button onClick={() => toggleReadMutation.mutate(link)}>
              {link.is_read ? 'Mark unread' : 'Mark read'}
            </button>{' '}
            <button onClick={() => deleteMutation.mutate(link.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
