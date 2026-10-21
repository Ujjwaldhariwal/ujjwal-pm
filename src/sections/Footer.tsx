import { useState } from 'react'
import { EMAIL } from '../data'

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* the address stays selectable */ }
  }
  return (
    <footer className="board-foot" id="board">
      <div className="bf-l">
        <p className="lbl">Final stop</p>
        <h2>Board at your team.</h2>
        <div className="mail-row">
          <span className="mail">{EMAIL}</span>
          <button className="copy" onClick={copy}>{copied ? 'Copied' : 'Copy email'}</button>
        </div>
      </div>
      <div className="bf-r">
        <p>Open to Associate and Technical PM roles</p>
        <p>
          <a href="https://linkedin.com/in/ujjwal-dhariwal" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/Ujjwaldhariwal" target="_blank" rel="noreferrer">GitHub</a>
        </p>
        <p>Noida / Gurugram</p>
      </div>
    </footer>
  )
}
