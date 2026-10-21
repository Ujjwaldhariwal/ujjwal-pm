import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, scrollToId } from '../lib/motion'

const STOP = new Set(['the', 'and', 'for', 'who', 'can', 'with', 'that', 'need', 'into', 'your', 'our'])
import { QUERIES, STATIONS } from '../data'

const PROMPT = 'I need a PM who can'
const DEMO = ['find the real pain', 'run stakeholder interviews', 'decide what to automate']

function Flap({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let n = 0
    const id = setInterval(() => {
      n++
      el.textContent = text.split('').map((c, i) => (i < n / 2 || c === ' ' ? c : chars[(Math.random() * chars.length) | 0])).join('')
      if (n / 2 > text.length) { clearInterval(id); el.textContent = text }
    }, 28)
    return () => clearInterval(id)
  }, [text])
  return <span ref={ref}>{text}</span>
}

export default function Sign({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [demo, setDemo] = useState('')
  const [active, setActive] = useState(0)
  const [touched, setTouched] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const h1 = useRef<HTMLHeadingElement>(null)

  // The planner types a few example questions on its own until the visitor takes over
  useEffect(() => {
    if (touched || prefersReducedMotion()) return
    let i = 0, k = 0, dir = 1, wait = 0
    const id = setInterval(() => {
      if (wait > 0) { wait--; return }
      const s = DEMO[i]
      k += dir
      setDemo(s.slice(0, k))
      if (k >= s.length) { dir = -1; wait = 28 }
      if (k <= 0) { dir = 1; i = (i + 1) % DEMO.length; wait = 4 }
    }, 55)
    return () => clearInterval(id)
  }, [touched])

  useEffect(() => {
    if (prefersReducedMotion() || !h1.current) return
    gsap.from(h1.current.querySelectorAll('.ch'), { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.04, delay: 0.15 })
  }, [])

  const term = (touched ? q : demo).trim().toLowerCase()
  const results = useMemo(() => {
    if (!term) return QUERIES.slice(0, 4)
    const words = term.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
    return QUERIES.map((r) => {
      const st = STATIONS.find((s) => s.id === r.station)!
      const hay = (r.text + ' ' + st.tags.join(' ') + ' ' + st.name).toLowerCase()
      const score = words.reduce((a, w) => a + (hay.includes(w) ? 2 : 0) + (r.text.toLowerCase().startsWith(w) ? 1 : 0), 0)
      return { r, score }
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map((x) => x.r)
  }, [term])

  useEffect(() => setActive(0), [term])

  const go = (station: string) => onPick(station)

  const mark = (text: string) => {
    if (!term) return <span className="k">{text}</span>
    const words = term.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
    const re = words.length ? new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi') : null
    if (!re) return <span className="k">{text}</span>
    return <span className="k">{text.split(re).map((p, i) => (i % 2 ? <b key={i}>{p}</b> : p))}</span>
  }

  return (
    <section className="sign" id="top">
      <div className="sign-panel">
        <nav className="topnav" aria-label="Sections">
          <span className="me">Ujjwal Dhariwal</span>
          <div>
            <button onClick={() => scrollToId('line')}>The line</button>
            <button onClick={() => scrollToId('desk')}>Help desk</button>
            <button onClick={() => scrollToId('board')}>Contact</button>
          </div>
        </nav>

        <div className="next">
          <p className="lbl">Next station</p>
          <h1 ref={h1} aria-label="Product.">
            {'Product.'.split('').map((c, i) => <span key={i} className="cw"><span className="ch">{c}</span></span>)}
          </h1>
          <p className="hi" lang="hi">अगला स्टेशन: प्रोडक्ट</p>
        </div>

        <div className="board" aria-label="Departure board">
          <p className="h">Departures · Platform 1</p>
          <p className="r"><span>Line</span><span><Flap text="ENGINEER → APM" /></span></p>
          <p className="r"><span>Stations so far</span><span><Flap text="7" /></span></p>
          <p className="r"><span>Users served</span><span><Flap text="2,000+ A DAY" /></span></p>
          <p className="r"><span>CGPA</span><span><Flap text="9.69" /></span></p>
          <p className="r"><span>Boarding at</span><span><Flap text="NOIDA / GURUGRAM" /></span></p>
        </div>
      </div>
      <div className="stripe" />

      <div className="planner">
        <div className="pl-top">
          <span>Plan a journey through my work</span>
          <span className="pill"><b>From</b>your hiring problem</span>
          <span className="swap" aria-hidden="true">⇄</span>
          <span className="pill"><b>To</b>the station that solved it</span>
        </div>
        <div className="box" onClick={() => input.current?.focus()}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7" /><path d="M16 16l5 5" /></svg>
          <label htmlFor="planner-q" className="prompt">{PROMPT}</label>
          <div className="field">
            <input
              id="planner-q"
              ref={input}
              value={touched ? q : demo}
              placeholder={touched ? 'type a skill…' : ''}
              autoComplete="off"
              role="combobox"
              aria-expanded="true"
              aria-controls="planner-list"
              aria-activedescendant={results[active] ? `opt-${active}` : undefined}
              onFocus={() => { if (!touched) { setTouched(true); setQ('') } }}
              onChange={(e) => { setTouched(true); setQ(e.target.value) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
                if (e.key === 'Enter' && results[active]) go(results[active].station)
              }}
            />
          </div>
          <span className="ms">{results.length ? `${results.length} station${results.length > 1 ? 's' : ''} match` : 'no stop yet'}</span>
        </div>
        <ul className="drop" id="planner-list" role="listbox">
          {results.map((r, i) => {
            const st = STATIONS.find((s) => s.id === r.station)!
            return (
              <li
                key={r.text}
                id={`opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={`s ${i === active ? 'on' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.station)}
              >
                <span className={`dot ${st.line}`} />
                <span className="txt"><span className="pm">a PM who can</span> {mark(r.text)}</span>
                <span className="proof">{r.proof}<span className="st">{st.name}</span></span>
              </li>
            )
          })}
          {!results.length && (
            <li className="empty">No station for that yet. Try “users”, “metrics”, “interviews” or “automation”.</li>
          )}
        </ul>
      </div>
    </section>
  )
}
