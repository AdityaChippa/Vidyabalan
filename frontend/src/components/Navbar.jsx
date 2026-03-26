export default function Navbar({ onSignUp, onSignIn }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
         style={{
           padding: '18px 48px',
           background: 'rgba(250,248,243,0.88)',
           backdropFilter: 'blur(16px)',
           borderBottom: '1px solid var(--border2)',
           animation: 'fadeUp 0.6s ease both'
         }}>
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <div className="w-[34px] h-[34px] rounded-[10px] grid place-items-center"
             style={{ background: 'var(--saffron)', fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', fontStyle: 'italic' }}>V</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Vidya<span style={{ color: 'var(--saffron)' }}>AI</span>
        </span>
      </a>
      <ul className="hidden md:flex items-center gap-8 list-none">
        <li><a href="#features" className="text-sm font-medium no-underline transition-colors hover:text-saffron" style={{ color: 'var(--ink2)' }}>Features</a></li>
        <li><a href="#how" className="text-sm font-medium no-underline transition-colors hover:text-saffron" style={{ color: 'var(--ink2)' }}>How it works</a></li>
        <li><a href="#pruning" className="text-sm font-medium no-underline transition-colors hover:text-saffron" style={{ color: 'var(--ink2)' }}>Context Pruning</a></li>
        <li>
          <button onClick={onSignUp}
            className="text-sm font-medium no-underline py-[9px] px-5 rounded-lg transition-all border-none cursor-pointer"
            style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-body)' }}>
            Sign Up Free →
          </button>
        </li>
      </ul>
    </nav>
  )
}
