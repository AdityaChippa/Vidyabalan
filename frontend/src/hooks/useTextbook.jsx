import { useState, useEffect } from 'react'
import { apiJson } from '../supabaseClient'

export function useTextbook() {
  const [textbooks, setTextbooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTextbooks = async () => {
    try {
      setLoading(true)
      const data = await apiJson('/api/textbooks/')
      setTextbooks(data)
    } catch (e) {
      console.error('Failed to fetch textbooks:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchChapters = async (textbookId) => {
    try {
      return await apiJson(`/api/textbooks/${textbookId}/chapters`)
    } catch {
      return []
    }
  }

  const fetchTextbook = async (textbookId) => {
    try {
      return await apiJson(`/api/textbooks/${textbookId}`)
    } catch {
      return null
    }
  }

  useEffect(() => { fetchTextbooks() }, [])

  return { textbooks, loading, fetchTextbooks, fetchChapters, fetchTextbook }
}
