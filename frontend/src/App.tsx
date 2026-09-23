import { useEffect, useState } from 'react'
import './App.css'

type Link = {
  id: number
  url: string
  note: string | null
  tags: string | null
  created_at: string
  is_read: boolean
}

const API_URL = 'http://localhost:8000'

function App() {
  // ② STATE: your memory boxes
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form inputs: one box per field, so React always knows what's typed
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState('')

  // ③ EFFECT: GET /links when the page first loads
  useEffect(() => {
    // useEffect can't be async itself, so we make an async helper and call it
    async function loadLinks() {
      try {
        // 1. Ask the server. `await` = pause here until it answers.
        const res = await fetch(`${API_URL}/links`)

        // 2. fetch only throws if the network fails. A 404/500 still
        //    "succeeds", so we check res.ok ourselves.
        if (!res.ok) {
          throw new Error(`Server said ${res.status}`)
        }

        // 3. The body arrives as text. Turn it into JS objects.
        const data: Link[] = await res.json()
        console.log('links from API:', data)

        // 4. Put it in the memory box → React redraws with the links
        setLinks(data)
      } catch (err) {
        // Anything that went wrong above lands here
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        // Runs whether it worked or failed: we're done waiting
        setLoading(false)
      }
    }

    loadLinks()
  }, []) // [] = only run once, when the page first appears

  // ④ HANDLERS: run when the user clicks, so they're plain functions,
  //    NOT inside useEffect

  // POST: create a new link
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault() // stop the browser's default "reload the page" on submit
    setError(null)

    try {
      const res = await fetch(`${API_URL}/links`, {
        method: 'POST',
        // Tell the server "the body is JSON"
        headers: { 'Content-Type': 'application/json' },
        // fetch sends text, so turn the object into a JSON string.
        // `|| null` sends null instead of "" for empty optional fields.
        body: JSON.stringify({ url, note: note || null, tags: tags || null }),
      })
      if (!res.ok) throw new Error(`Create failed: ${res.status}`)

      // The server sends back the saved link (with its new id + created_at)
      const created: Link = await res.json()

      // New list = new link first, then all the old ones
      setLinks([created, ...links])

      // Clear the form
      setUrl('')
      setNote('')
      setTags('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // DELETE: remove a link
  async function handleDelete(id: number) {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/links/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`)

      // 204 = no body, so nothing to read. Keep every link except this one.
      setLinks(links.filter((link) => link.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // PATCH: flip is_read on one link
  async function handleToggleRead(link: Link) {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // PATCH = only send the field that changed
        body: JSON.stringify({ is_read: !link.is_read }),
      })
      if (!res.ok) throw new Error(`Update failed: ${res.status}`)

      const updated: Link = await res.json()

      // Swap in the updated link, leave the rest alone
      setLinks(links.map((l) => (l.id === updated.id ? updated : l)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <main>
      <h1>Link Saver</h1>

      {/* ⑤ FORM: each input shows its state box, and typing updates the box */}
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
        <button type="submit">Save link</button>
      </form>

      {/* ⑥ LOADING / ERROR messages */}
      {/* `condition && <thing>` = only show <thing> if condition is true */}
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Done loading, no error, but nothing saved yet */}
      {!loading && !error && links.length === 0 && <p>No links yet.</p>}

      {/* ⑦ LIST: turn each link object into a <li> */}
      <ul>
        {links.map((link) => (
          // `key` lets React tell rows apart when the list changes
          <li key={link.id}>
            <a href={link.url} target="_blank">{link.url}</a>
            {link.note && <span> — {link.note}</span>}
            {link.tags && <small> [{link.tags}]</small>}{' '}
            {/* Arrow function so the handler runs on click, not on render */}
            <button onClick={() => handleToggleRead(link)}>
              {link.is_read ? 'Mark unread' : 'Mark read'}
            </button>{' '}
            <button onClick={() => handleDelete(link.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
