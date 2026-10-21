import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, scrollToId, scrollToY, ScrollTrigger } from '../lib/motion'
import { STATIONS } from '../data'

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
      end: '+=1600',
      pin: true,
      scrub: 0.6,
      onUpdate: (s) => {
        if (locked.current) return
        fromScroll.current = true
        const L = 20 + s.progress * (total - 20)
        pos.current.L = L
        place(L)
        const x = route.current!.getPointAtLength(L).x
        const passed = MAIN_IDS.map((id) => STATIONS.find((s) => s.id === id)!).filter((s) => s.x <= x + 4)
        const last = passed[passed.length - 1]
        if (last && last.id !== stationRef.current) onStation(last.id)
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
                <circle cx={s.x} cy={s.y} r="26" className="hit" />
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

          <g ref={train} className="train" aria-hidden="true">
            <rect x="-34" y="-17" width="68" height="34" rx="11" />
            <rect x="-24" y="-8" width="13" height="11" rx="2" className="win" />
            <rect x="-7" y="-8" width="13" height="11" rx="2" className="win" />
            <rect x="10" y="-8" width="13" height="11" rx="2" className="win" />
            <circle cx="30" cy="0" r="3" className="lamp" />
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
