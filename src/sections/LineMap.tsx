import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, scrollToId, scrollToY, ScrollTrigger } from '../lib/motion'
import { STATIONS } from '../data'
import { haptic } from '../lib/haptics'

const Y = 250
const MAIN = `M70 ${Y} L960 ${Y} L1050 ${Y - 90} L1370 ${Y - 90}`
const BRANCH = `M620 ${Y} L620 ${Y + 150} L690 ${Y + 150}`
const MAIN_IDS = ['chitkara', 'hippo', 'intern', 'power', 'icrs', 'horizon']

type Props = { station: string; onStation: (id: string) => void; jump: number }

export default function LineMap({ station, onStation, jump }: Props) {
  const sec = useRef<HTMLElement>(null)
  const route = useRef<SVGPathElement>(null)
  const train = useRef<SVGGElement>(null)
  const done = useRef<SVGPathElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [reached, setReached] = useState(0)
  const pos = useRef({ L: 0 })
  const fromScroll = useRef(false)
  const trigRef = useRef<ScrollTrigger | null>(null)
  const locked = useRef(false)

  const st = STATIONS.find((s) => s.id === station) ?? STATIONS[5]
  const stationRef = useRef(station)
  stationRef.current = station

  // Length along the main route for each station on it
  const lengthAt = (x: number) => {
    const p = route.current!
    const total = p.getTotalLength()
    let lo = 0, hi = total
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (p.getPointAtLength(mid).x < x) lo = mid
      else hi = mid
    }
    return lo
  }

  const place = (L: number) => {
    const p = route.current!, t = train.current!, d = done.current!
    const a = p.getPointAtLength(L)
    const b = p.getPointAtLength(Math.min(p.getTotalLength(), L + 2))
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
    t.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`)
    d.style.strokeDashoffset = String(p.getTotalLength() - L)
    setReached(a.x)
  }

  useLayoutEffect(() => {
    const p = route.current!
    const total = p.getTotalLength()
    done.current!.style.strokeDasharray = `${total}`
    pos.current.L = lengthAt(st.line === 'freelance' ? 620 : st.x)
    place(pos.current.L)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Desktop: pin the map and let scroll drive the train from college to "your team"
  useEffect(() => {
    if (window.innerWidth < 900 || prefersReducedMotion()) return
    const total = route.current!.getTotalLength()
    const trig = ScrollTrigger.create({
      trigger: sec.current,
      start: 'top top',
      end: '+=1200',
      pin: true,
      scrub: 0.15, // near 1:1 with the wheel (was 0.6)
      onUpdate: (s) => {
        if (locked.current) return
        fromScroll.current = true
        const L = 20 + s.progress * (total - 20)
        pos.current.L = L
        place(L)
        const x = route.current!.getPointAtLength(L).x
        const passed = MAIN_IDS.map((id) => STATIONS.find((s) => s.id === id)!).filter((s) => s.x <= x + 4)
        const last = passed[passed.length - 1]
        if (last && last.id !== stationRef.current) { haptic.tick(); onStation(last.id) }
        else fromScroll.current = false
      },
    })
    trigRef.current = trig
    return () => trig.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A search pick scrolls to the point on the ride where that station sits, then holds it there
  useEffect(() => {
    if (!jump) return
    const t = trigRef.current
    if (!t) { scrollToId('line'); return }
    const total = route.current!.getTotalLength()
    const target = lengthAt(st.line === 'freelance' ? 620 : st.x)
    const prog = Math.max(0, (target - 20) / (total - 20))
    locked.current = true
    scrollToY(t.start + prog * (t.end - t.start) + 1, () => { setTimeout(() => { locked.current = false }, 120) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jump])

  // Clicking a station (or picking a search result) glides the train there
  useEffect(() => {
    const sc = scroller.current
    if (sc && sc.scrollWidth > sc.clientWidth) {
      const px = ((st.line === 'freelance' ? 690 : st.x) / 1440) * sc.scrollWidth
      sc.scrollTo({ left: Math.max(0, px - sc.clientWidth / 2), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
    if (fromScroll.current) { fromScroll.current = false; return }
    const target = lengthAt(st.line === 'freelance' ? 620 : st.x)
    if (prefersReducedMotion()) { pos.current.L = target; place(target); return }
    gsap.to(pos.current, { L: target, duration: 1.1, ease: 'power3.inOut', onUpdate: () => place(pos.current.L) })
    if (card.current) gsap.fromTo(card.current, { y: 14, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station])

  return (
    <section className="line" id="line" ref={sec}>
      <div className="line-head">
        <h2>The line so far.</h2>
        <p>Seven stations from college to today. Each one is a problem, a decision and a number. Scroll to ride it, or tap a station.</p>
      </div>

      <p className="swipe">Swipe the line sideways, then tap a station.</p>
      <div className="map-scroll" ref={scroller}>
        <svg viewBox="0 0 1440 470" className="map" role="group" aria-label="Career line map">
          <path d={BRANCH} className="ln freelance" />
          <path ref={route} d={MAIN} className="ln route" />
          <path d={`M960 ${Y} L1050 ${Y - 90} L1210 ${Y - 90}`} className="ln product" />
          <path d={`M1210 ${Y - 90} L1370 ${Y - 90}`} className="ln product dashed" />
          <path ref={done} d={MAIN} className="ln travelled" />

          {STATIONS.map((s) => {
            const on = s.id === station
            const passed = s.line === 'eng' ? s.x <= reached + 4 : reached >= 620
            const ty = s.labelUp ? s.y - 44 : s.y + 50
            const anchor = s.line === 'freelance' ? 'start' : 'middle'
            const tx = s.line === 'freelance' ? s.x + 22 : s.x
            return (
              <g
                key={s.id}
                className={`stn ${on ? 'on' : ''} ${passed ? 'passed' : ''} ${s.line}`}
                tabIndex={0}
                role="button"
                aria-pressed={on}
                aria-label={`${s.name}: ${s.short}`}
                onClick={() => onStation(s.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onStation(s.id))}
              >
                <circle cx={s.x} cy={s.y} r="36" className="hit" />
                <circle cx={s.x} cy={s.y} r={on ? 15 : 11} className="ring" />
                <text x={tx} y={s.line === 'freelance' ? s.y - 4 : ty} textAnchor={anchor} className="nm">{s.name}</text>
                <text x={tx} y={(s.line === 'freelance' ? s.y - 4 : ty) + 21} textAnchor={anchor} className="ds">{s.short}</text>
              </g>
            )
          })}

          <g className="interchange">
            <circle cx="960" cy={Y} r="22" />
            <circle cx="960" cy={Y} r="9" className="core" />
            <text x="986" y={Y + 46} className="nm big">Interchange</text>
            <text x="986" y={Y + 68} className="ds">change here for Product</text>
          </g>
          <g className="future">
            <circle cx="1130" cy={Y - 90} r="11" className="ring" />
            <text x="1130" y={Y - 130} textAnchor="middle" className="nm">Associate PM</text>
            <text x="1130" y={Y - 110} textAnchor="middle" className="ds">discovery · PRDs · metrics</text>
            <circle cx="1370" cy={Y - 90} r="16" className="goal" />
            <text x="1384" y={Y - 40} textAnchor="end" className="nm big">Your team</text>
            <text x="1384" y={Y - 18} textAnchor="end" className="ds">your platform, next stop</text>
          </g>

          <g ref={train} className="train metro-car" aria-hidden="true">
            <defs>
              <linearGradient id="trainBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient id="cabGlass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="70%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
              <filter id="headlightGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* bogies */}
            <rect x="-30" y="15" width="16" height="5" rx="2" fill="#1E293B" />
            <rect x="14" y="15" width="16" height="5" rx="2" fill="#1E293B" />
            {/* body with a rounded driving cab at the front */}
            <path d="M -38 -16 L 22 -16 Q 44 -16 46 0 Q 44 16 22 16 L -38 16 Q -42 16 -42 0 Q -42 -16 -38 -16 Z" fill="url(#trainBody)" stroke="#64748B" strokeWidth="1.2" />
            {/* line livery: yellow over blue */}
            <path d="M -41 4 L 44 4" stroke="#F4C20D" strokeWidth="3" />
            <path d="M -41 7.5 L 42 7.5" stroke="#1F5FAD" strokeWidth="1.5" />
            {/* windscreen */}
            <path d="M 22 -12 L 36 -12 Q 41 -12 42 -4 L 42 0 L 22 0 Z" fill="url(#cabGlass)" />
            {/* passenger windows */}
            <rect x="-34" y="-11" width="14" height="9" rx="2.5" fill="#0F172A" />
            <rect x="-16" y="-11" width="14" height="9" rx="2.5" fill="#0F172A" />
            <rect x="2" y="-11" width="14" height="9" rx="2.5" fill="#0F172A" />
            {/* headlamps */}
            <circle cx="44" cy="-5" r="2" fill="#FEF08A" filter="url(#headlightGlow)" />
            <circle cx="44" cy="10" r="2" fill="#FEF08A" filter="url(#headlightGlow)" />
          </g>
        </svg>
      </div>

      <div className="case" ref={card} aria-live="polite">
        <div className="case-l">
          <p className="crumb"><i className={st.line} />{st.name} · {st.years}</p>
          <h3>{st.headline}</h3>
        </div>
        <ol className="steps">
          <li><b>Problem</b><span>{st.problem}</span></li>
          <li><b>Insight</b><span>{st.insight}</span></li>
          <li><b>Decision</b><span>{st.decision}</span></li>
          <li className="res"><b>Result</b><strong>{st.result.big}</strong><span>{st.result.unit}</span></li>
        </ol>
      </div>
    </section>
  )
}
