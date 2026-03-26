export default function ChatBubble({ role, content, source, meta }) {
  const isUser = role === 'user'
  const renderMarkdown = (text) => {
    if (!text) return ''
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin-left:8px;margin-bottom:4px"><strong>$1.</strong> $2</div>')
    html = html.replace(/\n/g, '<br/>')
    return html
  }
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fadeUp`}>
      <div className={`max-w-[85%] py-3 px-4 text-sm leading-relaxed ${isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
        style={{ background: isUser ? 'var(--ink)' : 'var(--paper)', color: isUser ? 'var(--paper)' : 'var(--ink)', border: isUser ? 'none' : '1px solid var(--border)' }}>
        {isUser ? <span>{content}</span> : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />}
        {!isUser && meta?.source && (
          <div className="mt-2 text-[11px] font-medium" style={{ color: 'var(--saffron)' }}>📖 {meta.source}</div>
        )}
      </div>
    </div>
  )
}
