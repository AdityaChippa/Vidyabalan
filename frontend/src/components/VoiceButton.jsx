export default function VoiceButton({ listening, onStart, onStop }) {
  return (
    <button onClick={listening ? onStop : onStart}
      className="w-10 h-10 rounded-full grid place-items-center border-none cursor-pointer transition-all flex-shrink-0"
      style={{
        background: listening ? '#e74c3c' : 'var(--paper2)',
        color: listening ? 'white' : 'var(--ink3)',
      }}
      title={listening ? 'Stop listening' : 'Voice input'}>
      {listening ? (
        <span className="text-lg animate-pulse">⏹</span>
      ) : (
        <span className="text-lg">🎙️</span>
      )}
      {listening && (
        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" style={{ animationDuration: '1.5s' }} />
      )}
    </button>
  )
}
