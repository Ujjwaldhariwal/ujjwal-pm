import { useEffect, useState } from 'react'
import { startSmoothScroll } from './lib/motion'
import Sign from './sections/Sign'
import LineMap from './sections/LineMap'
import HelpDesk from './sections/HelpDesk'
import Footer from './sections/Footer'

export default function App() {
  const [station, setStation] = useState('horizon')
  const [jump, setJump] = useState(0)
  useEffect(() => { startSmoothScroll() }, [])
  return (
    <>
      <a className="skip" href="#line">Skip to the line</a>
      <main>
        <Sign onPick={(id) => { setStation(id); setJump((j) => j + 1) }} />
        <LineMap station={station} onStation={setStation} jump={jump} />
        <HelpDesk />
        <Footer />
      </main>
    </>
  )
}
