import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { EMAIL } from '../data'
import { haptic } from '../lib/haptics'

const STAGES = [
  { b: 'Received', s: 'today' },
  { b: 'Users heard', s: 'interviews first' },
  { b: 'Prioritised', s: 'impact vs effort' },
  { b: 'Shipped', s: 'small, then iterate' },
  { b: 'Measured', s: 'the metric you named' },
]

const CLOSED = [
  { q: 'Most chats ask the same 10 things.', a: 'AI chatbot shipped.', m: '40%', mu: 'of queries now self-serve.' },
  { q: "I can't read this in English.", a: 'Hindi and English via i18next.', m: '2,000+', mu: 'people a day now use it.' },
  { q: 'Uploading documents takes forever.', a: 'Moved to S3 presigned URLs.', m: '60%', mu: 'faster.' },
]

export default function HelpDesk() {
  const [team, setTeam] = useState('')
  const [pain, setPain] = useState('')
  const [who, setWho] = useState('')
  const [filed, setFiled] = useState(false)
  const [stage, setStage] = useState(0)
  const [copied, setCopied] = useState(false)
  const [no] = useState(() => String(1 + Math.floor(Math.random() * 899)).padStart(4, '0'))
  const stamp = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!filed) return
    const buzz = window.setTimeout(() => haptic.stamp(), 380) // lands with the stamp
    const el = stamp.current
    if (el && !prefersReducedMotion()) {
      gsap.fromTo(el, { scale: 2.4, opacity: 0, rotate: -30 }, { scale: 1, opacity: 0.9, rotate: -14, duration: 0.42, ease: 'power4.in' })
      gsap.fromTo(sheet.current, { x: 0 }, { keyframes: { x: [0, -4, 3, -2, 0] }, duration: 0.3, delay: 0.4 })
    }
    const ids = [1, 2, 3].map((n) => window.setTimeout(() => setStage(n), 650 + n * 520))
    return () => { ids.forEach(clearTimeout); clearTimeout(buzz) }
  }, [filed])

  const summary = () =>
    `Hi Ujjwal,\n\nTeam: ${team || '(your team)'}\nWhat's broken: ${pain || '(the problem)'}\nWho it affects: ${who || '(your users)'}\n\nLet's talk.`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${EMAIL}\n\n${summary()}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="desk" id="desk">
      <div className="desk-h">
        <span className="l"><i aria-hidden="true">?</i>Station help desk: tell me what's broken in your product</span>
        <span className="r" lang="hi">शिकायत दर्ज करें</span>
      </div>

      <div className="desk-body">
        <div className="desk-left">
          <h2>Every good product starts as a complaint.</h2>
          <p>
            I worked on a civic complaint portal used by 2,000+ people a day. It taught me to hear the real problem under the
            ticket. Fill in the form with a problem your team has, and I'll show you how I'd work it.
          </p>
        </div>

        <form
          ref={sheet}
          className={`form ${filed ? 'filed' : ''}`}
          onSubmit={(e) => { e.preventDefault(); setFiled(true); setStage(0) }}
        >
          <div className="fh">
            <div className="t">Product Grievance Form<small>for hiring managers, filed with Ujjwal</small></div>
            <div className="no">Complaint no.<b>UD/2026/{no}</b></div>
          </div>
          <label className="f" htmlFor="g-team">
            <span>Filed by</span>
            <input id="g-team" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Hiring manager, consumer app team" disabled={filed} />
          </label>
          <label className="f" htmlFor="g-pain">
            <span>What's broken in your product?</span>
            <textarea id="g-pain" rows={2} value={pain} onChange={(e) => setPain(e.target.value)} placeholder="Users sign up, then vanish before their first order." disabled={filed} />
          </label>
          <label className="f" htmlFor="g-who">
            <span>Who is affected</span>
            <input id="g-who" value={who} onChange={(e) => setWho(e.target.value)} placeholder="New users, week one" disabled={filed} />
          </label>
          <div className="f static"><span>Assigned to</span><p>Ujjwal Dhariwal, engineer turned PM</p></div>

          <ol className="status" aria-label="Complaint status">
            {STAGES.map((s, i) => (
              <li key={s.b} className={filed && i <= stage ? 'done' : ''}><b>{s.b}</b>{s.s}</li>
            ))}
          </ol>

          <div className="form-foot">
            <div className="sig">Officer in charge<i>U. Dhariwal</i></div>
            {!filed ? (
              <button type="submit" className="lodge">Lodge complaint</button>
            ) : (
              <div className="after">
                <p>Logged. Send it to me and I'll reply with how I'd work it.</p>
                <div className="mail-row">
                  <span className="mail" tabIndex={0}>{EMAIL}</span>
                  <button type="button" className="copy" onClick={copy}>{copied ? 'Copied with your notes' : 'Copy email + notes'}</button>
                </div>
                <button type="button" className="again" onClick={() => { setFiled(false); setStage(0) }}>File another</button>
              </div>
            )}
          </div>
          <div ref={stamp} className="stamp" aria-hidden={!filed} hidden={!filed}>
            <div className="in"><div className="a">RECEIVED</div><div className="b">SLA: 2 SPRINTS</div></div>
          </div>
        </form>

        <aside className="queue">
          <h3>Complaints I've already closed</h3>
          {CLOSED.map((c) => (
            <div className="tk" key={c.q}>
              <p className="q">“{c.q}”</p>
              <p className="r">{c.a} <b>{c.m}</b> {c.mu}</p>
            </div>
          ))}
          <div className="tk open">
            <p className="q">“Our team needs a PM who can talk to engineers.”</p>
            <p className="r">Open. Waiting for your call.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
