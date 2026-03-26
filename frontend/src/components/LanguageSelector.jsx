const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
]

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {LANGUAGES.map(lang => (
        <button key={lang.code} onClick={() => onChange(lang.code)}
          className="py-1 px-2.5 rounded-full text-[12px] font-medium border-none cursor-pointer transition-all"
          style={{
            background: value === lang.code ? 'var(--saffron-pale)' : 'transparent',
            color: value === lang.code ? 'var(--saffron)' : 'var(--ink3)',
            border: value === lang.code ? '1px solid rgba(232,96,28,0.2)' : '1px solid transparent',
            fontFamily: 'var(--font-body)'
          }}>
          {lang.label}
        </button>
      ))}
    </div>
  )
}
