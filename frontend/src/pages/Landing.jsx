import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('signin')
  const [pruneTab, setPruneTab] = useState('without')

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  // Scroll reveal
  const revealRefs = useRef([])
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.style.opacity = 1, e.target.style.transform = 'translateY(0)' })
    }, { threshold: 0.1 })
    revealRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])
  const addRevealRef = (el) => { if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el) }

  const openModal = (tab) => { setModalTab(tab); setModalOpen(true) }

  const pruneBlocks = pruneTab === 'with' ? [
    { cls: 'prnd', text: 'Chapter 1 — pruned ✕' },
    { cls: 'prnd', text: 'Chapter 2 — pruned ✕' },
    { cls: 'rel', text: 'Chapter 3 — Force & Pressure ✓ (612 tokens)' },
    { cls: 'prnd', text: 'Chapter 4 — pruned ✕' },
    { cls: 'prnd', text: 'Chapter 5 — pruned ✕' },
    { cls: 'prnd', text: 'Chapter 6 — pruned ✕' },
    { cls: 'prnd', text: 'Chapter 7 — pruned ✕' },
    { cls: 'prnd', text: 'Chapter 8 — pruned ✕' },
  ] : [
    { cls: 'irr', text: 'Chapter 1 — Living World (8,200 tokens)' },
    { cls: 'irr', text: 'Chapter 2 — Cell Structure (7,400 tokens)' },
    { cls: 'rel', text: 'Chapter 3 — Force & Pressure ← relevant' },
    { cls: 'irr', text: 'Chapter 4 — Friction (6,100 tokens)' },
    { cls: 'irr', text: 'Chapter 5 — Sound (5,800 tokens)' },
    { cls: 'irr', text: 'Chapter 6 — Chemical Effects (9,200 tokens)' },
    { cls: 'irr', text: 'Chapter 7 — Stars & Solar System (7,600 tokens)' },
    { cls: 'irr', text: 'Chapter 8 — Pollution (4,900 tokens)' },
  ]

  const revealStyle = { opacity: 0, transform: 'translateY(22px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }

  const features = [
    { icon: '📄', bg: '#fff3e8', title: 'Smart PDF Upload', desc: 'Upload any textbook — even scanned image PDFs. OCR reads Hindi, Marathi, English. Chapters detected automatically with a live progress screen.', tag: 'OCR Enabled', tagBg: 'var(--saffron-pale)', tagColor: 'var(--saffron)' },
    { icon: '🧠', bg: '#e8f5ee', title: 'Ask AI — Context Pruning', desc: 'Ask anything from your book. The AI finds only the relevant paragraphs — not the whole textbook — saving 94% of API cost with instant answers.', tag: 'Intel Core Feature', tagBg: 'var(--green-pale)', tagColor: 'var(--green)' },
    { icon: '📋', bg: '#eef2ff', title: 'Auto Study Plan', desc: 'Enter your exam date. Get a day-by-day schedule with milestones, revision days, and chapter targets — built automatically from your textbook.', tag: 'AI Generated', tagBg: '#eef2ff', tagColor: '#4f6ef5' },
    { icon: '🎯', bg: '#fff8e8', title: 'Quiz Engine', desc: 'Generate quizzes from any chapter, topic, or custom page range. MCQ and short answer. Instant scoring with textbook citations for every answer.', tag: 'Page Range Select', tagBg: '#fff8e8', tagColor: '#b8860b' },
    { icon: '📊', bg: '#fce8e8', title: 'Progress Dashboard', desc: 'Track chapters completed, quiz scores, daily streaks, and weak areas. Visual graphs and the live pruning cost-savings meter for Intel judges.', tag: 'Live Analytics', tagBg: '#fce8e8', tagColor: '#c0392b' },
    { icon: '🎙️', bg: '#e8f8ff', title: 'Voice Mode', desc: 'Ask questions by speaking in Hindi or English. Hear answers read back aloud. Perfect for students in low-literacy households or without a keyboard.', tag: 'Multilingual TTS', tagBg: '#e8f8ff', tagColor: '#0077b6' },
  ]

  const steps = [
    { n: '01', h: 'Sign in with Google', p: 'One click. Your books, progress, and study plans follow you on any device — phone, tablet, school computer.' },
    { n: '02', h: 'Upload your textbook', p: 'Drop any PDF. The system reads it, detects chapters, runs OCR if needed, and builds your full study kit automatically in the background.' },
    { n: '03', h: 'Get your plan + quizzes', p: 'Within minutes, your day-wise study schedule is ready and 90+ quiz questions are pre-generated — no setup needed from your side.' },
    { n: '04', h: 'Ask, learn, repeat', p: 'Chat with your textbook, take quizzes, track progress. The system knows which topics need more attention and adjusts accordingly.' },
  ]

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navbar onSignUp={() => openModal('signup')} onSignIn={() => openModal('signin')} />

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ padding: '120px 24px 80px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 500, height: 500, background: 'rgba(232,96,28,0.08)', top: -150, right: -80, filter: 'blur(80px)', animation: 'float1 9s ease-in-out infinite' }} />
          <div className="absolute rounded-full" style={{ width: 400, height: 400, background: 'rgba(26,107,60,0.06)', bottom: -80, left: -60, filter: 'blur(80px)', animation: 'float2 11s ease-in-out infinite' }} />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--border2) 1px,transparent 1px),linear-gradient(90deg,var(--border2) 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg,#ff9933 33.33%,white 33.33%,white 66.66%,#138808 66.66%)' }} />
        </div>
        <style>{`@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(22px)}}`}</style>

        <div className="relative z-[2] text-center max-w-[840px]">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium mb-7 animate-fadeUp delay-2"
               style={{ background: 'var(--saffron-pale)', border: '1px solid rgba(232,96,28,0.2)', color: 'var(--saffron)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--saffron)', animation: 'blink 2s ease-in-out infinite' }} />
            Built for Bharat &nbsp;·&nbsp; Intel AI Challenge 2026
          </div>
          <h1 className="animate-fadeUp delay-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px,7vw,84px)', lineHeight: 1.06, letterSpacing: -2, color: 'var(--ink)', marginBottom: 22 }}>
            Every student deserves<br/>an <em style={{ fontStyle: 'italic', color: 'var(--saffron)' }}>intelligent</em> tutor
          </h1>
          <p className="animate-fadeUp delay-4" style={{ fontSize: 18, color: 'var(--ink3)', lineHeight: 1.65, maxWidth: 540, margin: '0 auto 44px' }}>
            Upload your state-board textbook. Get personalized answers, quizzes, and study plans — at <strong style={{ color: 'var(--ink2)', fontWeight: 500 }}>94% less cost</strong> than traditional AI, fast enough for any internet connection.
          </p>
          <div className="flex gap-3.5 items-center justify-center flex-wrap animate-fadeUp delay-5">
            <button className="btn-main" style={{ fontSize: 16, padding: '15px 30px' }} onClick={() => openModal('signup')}>Get Started Free →</button>
            <button className="btn-ghost" onClick={() => openModal('signin')}>Sign In</button>
            <a href="#features" className="btn-ghost" style={{ borderColor: 'transparent', color: 'var(--ink3)' }}>See how it works ↓</a>
          </div>
          <div className="flex gap-12 justify-center mt-16 pt-12 animate-fadeUp" style={{ borderTop: '1px solid var(--border)', animationDelay: '0.8s' }}>
            {[{ num: '94%', lbl: 'Cost reduction' }, { num: '<500ms', lbl: 'Response time' }, { num: '4', lbl: 'Indian languages' }, { num: '∞', lbl: 'Textbooks supported' }].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--ink)', lineHeight: 1, marginBottom: 5 }}>{s.num}</div>
                <div className="text-[13px]" style={{ color: 'var(--ink3)' }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div className="relative z-[2] w-full max-w-[660px] mx-auto mt-[60px] animate-fadeUp" style={{ animationDelay: '0.95s' }}>
          <div className="rounded-[20px] overflow-hidden" style={{ background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center gap-2.5 py-3 px-[18px]" style={{ background: 'var(--paper2)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex gap-[5px]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28ca41' }} />
              </div>
              <div className="flex-1 text-center text-[13px] font-medium" style={{ color: 'var(--ink2)' }}>VidyAI — Ask AI</div>
              <span className="text-[11px] font-medium px-2.5 py-[3px] rounded-full" style={{ background: 'var(--green-pale)', color: 'var(--green)', border: '1px solid rgba(26,107,60,.15)' }}>● Pruning ON</span>
            </div>
            <div className="p-[18px] flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-[10px] text-[13px]" style={{ background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--ink2)' }}>
                <div className="w-7 h-7 rounded-[6px] grid place-items-center text-[15px]" style={{ background: 'var(--saffron-pale)' }}>📘</div>
                Maharashtra Science Std. 8 — Chapter 3: Force &amp; Pressure
              </div>
              <div className="flex flex-col gap-[9px]">
                <div className="max-w-[85%] self-end py-[11px] px-[15px] rounded-[14px] rounded-br-[4px] text-sm leading-relaxed" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
                  What is the difference between contact and non-contact forces? Give examples.
                </div>
                <div className="max-w-[85%] self-start py-[11px] px-[15px] rounded-[14px] rounded-bl-[4px] text-sm leading-relaxed" style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <strong>Contact forces</strong> require physical touch — like friction (pushing a box) and muscular force.<br /><br />
                  <strong>Non-contact forces</strong> act at a distance — like gravitational force (Earth pulling objects) and magnetic force.<br /><br />
                  Example: kicking a ball is contact force; a magnet attracting iron filings is non-contact.
                  <div className="mt-1.5 text-[11px] font-medium" style={{ color: 'var(--saffron)' }}>📖 Source: Chapter 3, Page 42 — "Types of Forces"</div>
                </div>
              </div>
              {/* Token bar */}
              <div className="rounded-[10px] p-3.5 text-xs" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between mb-2" style={{ color: 'var(--ink3)' }}>
                  <span>Context sent to AI</span>
                  <span className="font-semibold" style={{ color: 'var(--green)' }}>Saved ₹0.037 on this query</span>
                </div>
                <div className="text-[11px] mb-1" style={{ color: 'var(--ink3)' }}>With pruning (VidyAI)</div>
                <div className="h-[5px] rounded-[3px] overflow-hidden mb-[3px]" style={{ background: 'var(--paper3)' }}>
                  <div className="h-full rounded-[3px]" style={{ width: '5%', background: 'var(--saffron)', animation: 'tokFill 1.6s ease 1.6s both' }} />
                </div>
                <style>{`@keyframes tokFill{from{width:0}}`}</style>
                <div className="flex justify-between text-[11px]" style={{ color: 'var(--ink3)' }}><span>612 tokens</span><span>Chapter 3 only</span></div>
                <div className="text-[11px] mt-2 mb-1" style={{ color: 'var(--ink3)' }}>Without pruning (baseline)</div>
                <div className="h-[5px] rounded-[3px] overflow-hidden mb-[3px]" style={{ background: 'var(--paper3)' }}>
                  <div className="h-full rounded-[3px]" style={{ width: '100%', background: '#ccc' }} />
                </div>
                <div className="flex justify-between text-[11px]" style={{ color: 'var(--ink3)' }}><span>84,300 tokens</span><span>Entire textbook</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-[1080px] mx-auto" id="features">
        <div ref={addRevealRef} style={revealStyle}>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] flex items-center gap-2 mb-3.5" style={{ color: 'var(--saffron)' }}>
            <span className="w-[18px] h-px" style={{ background: 'var(--saffron)' }} />What you get
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.1, letterSpacing: -1, color: 'var(--ink)', marginBottom: 14 }}>
            Everything a student needs.<br/>Nothing they don't.
          </h2>
          <p className="text-[17px] leading-relaxed max-w-[460px]" style={{ color: 'var(--ink3)' }}>From uploading a textbook to acing the exam — all in one place, in your language.</p>
        </div>
        <div ref={addRevealRef} className="grid gap-[2px] mt-14 rounded-[20px] overflow-hidden" style={{ ...revealStyle, gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', border: '1px solid var(--border)', background: 'var(--border2)' }}>
          {features.map((f, i) => (
            <div key={i} className="py-8 px-7 transition-colors hover:bg-white" style={{ background: 'var(--paper)' }}>
              <div className="w-[42px] h-[42px] rounded-xl grid place-items-center text-xl mb-[18px]" style={{ background: f.bg }}>{f.icon}</div>
              <div className="text-[17px] font-semibold mb-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: '-0.3px' }}>{f.title}</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink3)' }}>{f.desc}</p>
              <span className="inline-block mt-[13px] text-[11px] font-semibold uppercase tracking-[0.05em] px-2.5 py-[3px] rounded-full" style={{ background: f.tagBg, color: f.tagColor }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6" id="how" style={{ background: 'var(--ink)' }}>
        <div className="max-w-[1080px] mx-auto">
          <div ref={addRevealRef} style={revealStyle}>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] flex items-center gap-2 mb-3.5" style={{ color: 'var(--saffron2)' }}>
              <span className="w-[18px] h-px" style={{ background: 'var(--saffron2)' }} />The process
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.1, letterSpacing: -1, color: 'var(--paper)', marginBottom: 14 }}>
              Up and studying in four steps.
            </h2>
          </div>
          <div ref={addRevealRef} className="grid gap-9 mt-14" style={{ ...revealStyle, gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))' }}>
            {steps.map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 60, color: 'rgba(255,255,255,.06)', lineHeight: 1, marginBottom: -14 }}>{s.n}</div>
                <div className="text-lg font-medium mb-[9px]" style={{ fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>{s.h}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,248,243,.45)' }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRUNING */}
      <section className="py-24 px-6 max-w-[1080px] mx-auto" id="pruning">
        <div ref={addRevealRef} style={revealStyle}>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] flex items-center gap-2 mb-3.5" style={{ color: 'var(--saffron)' }}>
            <span className="w-[18px] h-px" style={{ background: 'var(--saffron)' }} />The technology
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.1, letterSpacing: -1, color: 'var(--ink)', marginBottom: 14 }}>
            Why Context Pruning<br/>changes everything.
          </h2>
          <p className="text-[17px] leading-relaxed max-w-[460px]" style={{ color: 'var(--ink3)' }}>Traditional AI reads your entire textbook for every question. VidyAI reads only what's needed.</p>
        </div>
        <div ref={addRevealRef} className="mt-14 rounded-[20px] overflow-hidden" style={{ ...revealStyle, background: 'white', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="flex" style={{ borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
            {['without', 'with'].map(t => (
              <button key={t} onClick={() => setPruneTab(t)}
                className="py-[15px] px-[22px] text-sm font-medium cursor-pointer border-none mb-[-1px] transition-all"
                style={{
                  fontFamily: 'var(--font-body)', background: 'transparent',
                  color: pruneTab === t ? 'var(--ink)' : 'var(--ink3)',
                  borderBottom: pruneTab === t ? '2px solid var(--saffron)' : '2px solid transparent'
                }}>
                {t === 'without' ? 'Without Pruning (Baseline)' : 'With Pruning (VidyAI)'}
              </button>
            ))}
          </div>
          <div className="p-7 grid gap-7" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.05em] mb-3.5" style={{ color: 'var(--ink3)' }}>Context sent to AI</div>
              <div className="flex flex-col gap-[3px]">
                {pruneBlocks.map((b, i) => {
                  const styles = {
                    rel: { background: 'rgba(232,96,28,.1)', color: 'var(--saffron)', border: '1px solid rgba(232,96,28,.2)' },
                    irr: { background: 'var(--paper2)', color: 'var(--ink3)', border: 'none' },
                    prnd: { background: 'transparent', color: 'var(--paper3)', border: '1px dashed var(--paper3)', fontStyle: 'italic' },
                  }
                  return (
                    <div key={i} className="h-[27px] rounded flex items-center px-2.5 text-[11px] font-medium transition-all"
                         style={styles[b.cls]}>{b.text}</div>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-3.5 justify-center">
              <div className="text-xs font-semibold uppercase tracking-[0.05em] mb-3.5" style={{ color: 'var(--ink3)' }}>Cost per 1,000 queries</div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-[72px] flex-shrink-0" style={{ color: 'var(--ink3)' }}>Baseline</span>
                <div className="flex-1 h-[7px] rounded overflow-hidden" style={{ background: 'var(--paper2)' }}>
                  <div className="h-full rounded" style={{ width: '100%', background: '#e0d8cc' }} />
                </div>
                <span className="text-[13px] font-semibold w-[52px] text-right" style={{ color: 'var(--ink3)' }}>₹420</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-[72px] flex-shrink-0" style={{ color: 'var(--ink3)' }}>VidyAI</span>
                <div className="flex-1 h-[7px] rounded overflow-hidden" style={{ background: 'var(--paper2)' }}>
                  <div className="h-full rounded transition-all duration-500" style={{ width: '6%', background: 'var(--saffron)' }} />
                </div>
                <span className="text-[13px] font-semibold w-[52px] text-right" style={{ color: 'var(--saffron)' }}>
                  ₹25
                </span>
              </div>
              <div className="p-3.5 rounded-[10px]" style={{ background: 'var(--green-pale)', border: '1px solid rgba(26,107,60,.15)' }}>
                <div className="text-[22px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--green)' }}>94% cheaper</div>
                <div className="text-[13px] mt-[3px]" style={{ color: 'var(--ink3)' }}>Per 1,000 student questions</div>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--ink3)' }}>
                At 10 questions/day per student, a school of 500 students saves <strong style={{ color: 'var(--ink)' }}>₹58,000/month</strong> versus baseline RAG.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section className="py-[72px] px-6" style={{ background: 'linear-gradient(135deg,var(--saffron-pale) 0%,var(--green-pale) 100%)' }}>
        <div ref={addRevealRef} className="max-w-[1080px] mx-auto text-center" style={revealStyle}>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] flex items-center gap-2 justify-center mb-3.5" style={{ color: 'var(--saffron)', paddingLeft: 26 }}>
            <span className="w-[18px] h-px" style={{ background: 'var(--saffron)' }} />Multilingual
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.1, letterSpacing: -1, color: 'var(--ink)' }}>
            Study in your mother tongue.
          </h2>
          <p className="text-[17px] mt-2.5" style={{ color: 'var(--ink3)' }}>Ask questions and get answers in the language you think in.</p>
          <div className="flex gap-3 flex-wrap justify-center mt-8">
            {['🇮🇳 English', '🇮🇳 हिंदी', '🇮🇳 मराठी', '🇮🇳 தமிழ்'].map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[15px] font-medium cursor-default transition-all hover:-translate-y-0.5"
                   style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--ink)', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[110px] px-6 text-center relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
             style={{ background: 'radial-gradient(circle,rgba(232,96,28,.06) 0%,transparent 70%)' }} />
        <div ref={addRevealRef} className="relative" style={revealStyle}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px,5vw,62px)', letterSpacing: -1.5, color: 'var(--ink)', marginBottom: 18, lineHeight: 1.1 }}>
            Ready to study smarter?
          </h2>
          <p className="text-lg mb-9" style={{ color: 'var(--ink3)' }}>Free to use · Works on any device · No download needed</p>
          <button className="btn-main mx-auto" style={{ fontSize: 17, padding: '18px 38px' }} onClick={() => openModal('signup')}>
            Create Free Account →
          </button>
          <p className="mt-3.5 text-sm" style={{ color: 'var(--ink3)' }}>
            Already have an account? <a onClick={() => openModal('signin')} className="cursor-pointer font-medium" style={{ color: 'var(--saffron)' }}>Sign in</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex items-center justify-between py-8 px-12 text-[13px] flex-wrap gap-3.5" style={{ borderTop: '1px solid var(--border)', color: 'var(--ink3)' }}>
        <a href="#" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-[10px] grid place-items-center text-[15px]" style={{ background: 'var(--saffron)', fontFamily: 'var(--font-display)', color: 'white', fontStyle: 'italic' }}>V</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>VidyaAI</span>
        </a>
        <span>Built for Intel AI Challenge 2026 · Made in India 🇮🇳</span>
        <div className="flex gap-5">
          <a href="#" className="no-underline hover:text-saffron" style={{ color: 'var(--ink3)' }}>Privacy</a>
          <a href="#" className="no-underline hover:text-saffron" style={{ color: 'var(--ink3)' }}>Terms</a>
          <a href="#" className="no-underline hover:text-saffron" style={{ color: 'var(--ink3)' }}>Contact</a>
        </div>
      </footer>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultTab={modalTab} />
    </div>
  )
}
