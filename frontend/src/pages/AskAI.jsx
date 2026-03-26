import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiJson, supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import ChatBubble from '../components/ChatBubble'
import TokenBar from '../components/TokenBar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AskAI() {
  const [params] = useSearchParams()
  const [textbooks, setTextbooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(params.get('textbook') || '')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pruning, setPruning] = useState(true)
  const [language, setLanguage] = useState('en')
  const chatEnd = useRef(null)

  useEffect(() => {
    apiJson('/api/textbooks/').then(t => {
      setTextbooks(t)
      if (!selectedBook && t.length) setSelectedBook(t[0].id)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBook) return
    apiJson(`/api/query/conversations/${selectedBook}`).then(convs => {
      if (convs && convs.length) {
        setMessages(convs.map(c => ({ role: c.role, content: c.content, meta: c.metadata || {} })).reverse())
      }
    }).catch(() => {})
  }, [selectedBook])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !selectedBook || loading) return
    const question = input.trim()
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: question, meta: {} }])
    const token = (await supabase.auth.getSession()).data.session?.access_token
    fetch(`${API}/api/query/conversations/${selectedBook}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role: 'user', content: question })
    }).catch(() => {})
    setMessages(prev => [...prev, { role: 'assistant', content: '', meta: {} }])
    try {
      const response = await fetch(`${API}/api/query/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, textbook_id: selectedBook, pruning_enabled: pruning, language })
      })
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let meta = {}
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.type === 'meta') {
              try { meta = JSON.parse(parsed.data) } catch { meta = parsed.data || {} }
            } else if (parsed.type === 'text') {
              fullText += (parsed.data || '')
              setMessages(prev => {
                const u = [...prev]
                if (u.length && u[u.length-1].role === 'assistant') u[u.length-1] = { ...u[u.length-1], content: fullText, meta }
                return u
              })
            } else if (parsed.type === 'done') {
              setMessages(prev => {
                const u = [...prev]
                if (u.length && u[u.length-1].role === 'assistant') u[u.length-1] = { ...u[u.length-1], content: fullText, meta }
                return u
              })
            }
          } catch {}
        }
      }
      fetch(`${API}/api/query/conversations/${selectedBook}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: 'assistant', content: fullText, metadata: meta })
      }).catch(() => {})
    } catch (e) {
      setMessages(prev => {
        const u = [...prev]
        if (u.length && u[u.length-1].role === 'assistant') u[u.length-1] = { ...u[u.length-1], content: 'Error: Could not get a response. Please try again.' }
        return u
      })
    }
    setLoading(false)
  }

  const langs = [{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'mr', label: 'मराठी' }, { code: 'ta', label: 'தமிழ்' }]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
        <div className="flex items-center gap-3 px-6 py-3 flex-wrap" style={{ borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
          <select value={selectedBook} onChange={e => setSelectedBook(e.target.value)} className="px-3 py-2 rounded-lg text-sm border-none" style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)', minWidth: 180 }}>
            {textbooks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <div className="flex gap-1 ml-auto">
            {langs.map(l => (
              <button key={l.code} onClick={() => setLanguage(l.code)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none" style={{ background: language === l.code ? 'var(--saffron-pale)' : 'transparent', color: language === l.code ? 'var(--saffron)' : 'var(--ink3)', fontFamily: 'var(--font-body)' }}>{l.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <span className="text-[12px]" style={{ color: 'var(--ink3)' }}>Context Pruning</span>
            <button onClick={() => setPruning(!pruning)} className="w-11 h-6 rounded-full cursor-pointer border-none relative transition-all" style={{ background: pruning ? 'var(--green)' : 'var(--paper3)' }}>
              <div className="w-4 h-4 rounded-full absolute top-1 transition-all" style={{ background: 'white', left: pruning ? 24 : 4 }} />
            </button>
            <span className="text-[11px] font-semibold" style={{ color: pruning ? 'var(--green)' : 'var(--ink3)' }}>• {pruning ? 'ON' : 'OFF'}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ background: 'var(--paper)' }}>
          {messages.length === 0 && <div className="text-center py-20"><div className="text-4xl mb-3">💬</div><p className="text-sm" style={{ color: 'var(--ink3)' }}>Ask any question about your textbook</p></div>}
          {messages.map((msg, i) => (
            <div key={i}>
              <ChatBubble role={msg.role} content={msg.content} meta={msg.meta} />
              {msg.role === 'assistant' && msg.meta?.tokens_used && (
                <TokenBar tokensUsed={msg.meta.tokens_used} tokensBaseline={msg.meta.tokens_baseline} costSaved={msg.meta.savings} source={msg.meta.source} />
              )}
            </div>
          ))}
          {loading && messages.length > 0 && messages[messages.length-1]?.content === '' && (
            <div className="flex justify-start mb-3"><div className="py-3 px-4 rounded-2xl rounded-bl-sm text-sm" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}><div className="flex gap-1"><div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--ink3)', animationDelay: '0ms' }} /><div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--ink3)', animationDelay: '150ms' }} /><div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--ink3)', animationDelay: '300ms' }} /></div></div></div>
          )}
          <div ref={chatEnd} />
        </div>
        <div className="px-6 py-4 flex gap-3 items-center" style={{ borderTop: '1px solid var(--border)', background: 'var(--paper)' }}>
          <div className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0" style={{ background: 'var(--paper2)' }}>📚</div>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask a question..." className="flex-1 px-4 py-3 rounded-xl text-sm border-none" style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl grid place-items-center cursor-pointer border-none" style={{ background: 'var(--ink)', color: 'var(--paper)', opacity: loading ? 0.5 : 1 }}>→</button>
        </div>
      </main>
    </div>
  )
}
