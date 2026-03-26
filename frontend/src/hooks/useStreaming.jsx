import { useState, useCallback } from 'react'
import { supabase, API_URL } from '../supabaseClient'

export function useStreaming() {
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [meta, setMeta] = useState(null)

  const startStream = useCallback(async ({ question, textbook_id, pruning_enabled = true, language = 'en' }) => {
    setStreaming(true)
    setStreamText('')
    setMeta(null)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || ''

    try {
      const res = await fetch(`${API_URL}/api/query/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, textbook_id, pruning_enabled, language }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Stream failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.type === 'meta') {
              setMeta(JSON.parse(payload.data))
            } else if (payload.type === 'text') {
              fullText += payload.data
              setStreamText(fullText)
            } else if (payload.type === 'done') {
              // stream complete
            }
          } catch {
            // skip parse errors
          }
        }
      }

      setStreaming(false)
      return { text: fullText, meta }
    } catch (err) {
      setStreaming(false)
      throw err
    }
  }, [])

  return { streaming, streamText, meta, startStream }
}
