export type Station = {
  id: string
  name: string
  short: string
  line: 'eng' | 'freelance' | 'product'
  x: number
  y: number
  labelUp: boolean
  years: string
  headline: string
  problem: string
  insight: string
  decision: string
  result: { big: string; unit: string }
  tags: string[]
}

/** Every number here comes from Ujjwal's résumés. Insights are written as he would tell them in an interview. */
export const STATIONS: Station[] = [
  {
    id: 'chitkara', name: 'Chitkara', short: 'B.E. CSE · CGPA 9.69', line: 'eng', x: 90, y: 250, labelUp: true, years: '2020 – 2024', headline: 'Learned more from shipping than from exams.',
    problem: 'Four years of computer science, mostly in theory.',
    insight: 'The useful lessons came from shipping side projects for real people, not from exams.',
    decision: 'Took on client work and an internship before graduating.',
    result: { big: '9.69', unit: 'CGPA' }, tags: ['foundations', 'engineering'],
  },
  {
    id: 'hippo', name: 'Hippo Toys', short: 'checkout → returns · +20% onboarding', line: 'eng', x: 230, y: 250, labelUp: false, years: '2023', headline: 'Sign-up was the wall. I took it down.',
    problem: 'New shoppers dropped off before they finished signing up.',
    insight: 'Account creation was the wall, not the products or the prices.',
    decision: 'Added Google sign-in and a multi-step checkout through to returns.',
    result: { big: '+20%', unit: 'onboarding' }, tags: ['onboarding', 'funnel', 'e-commerce', 'conversion', 'metrics'],
  },
  {
    id: 'intern', name: 'Infinite (intern)', short: 'Figma to production UI', line: 'eng', x: 390, y: 250, labelUp: true, years: 'Jan – Aug 2024', headline: 'Closed the gap between Figma and production.',
    problem: 'Designs and shipped screens drifted apart release after release.',
    insight: 'Most of the drift came from unclear specs, not from bad code.',
    decision: 'Worked straight from Figma with designers and flagged gaps before building.',
    result: { big: '1:1', unit: 'design to build' }, tags: ['design', 'collaboration', 'engineers', 'specs'],
  },
  {
    id: 'power', name: 'State power dashboard', short: '4 personas · TTFB under 2s', line: 'eng', x: 510, y: 250, labelUp: false, years: '2024 – now', headline: 'One dashboard, four very different users.',
    problem: 'Four kinds of users needed different answers from 5,000+ smart meters.',
    insight: 'One dashboard could serve all four if each role saw its own starting view.',
    decision: 'Mapped four personas and built role-based views on a shared data layer.',
    result: { big: '<2s', unit: 'time to first byte' }, tags: ['personas', 'users', 'dashboard', 'data', 'roles', 'b2b'],
  },
  {
    id: 'icrs', name: 'BEST ICRS', short: '2,000+ DAU · chatbot 40%', line: 'eng', x: 620, y: 250, labelUp: true, years: '2024', headline: 'Let the bot answer what people keep asking.',
    problem: 'Citizens waited on staff to answer the same routine questions.',
    insight: 'Most chats repeated a small set of questions that a bot could answer well.',
    decision: 'Shipped an AI chatbot for routine queries, plus Hindi and English and a WCAG 2.1 AA module.',
    result: { big: '40%', unit: 'queries self-served' }, tags: ['automation', 'ai', 'support', 'accessibility', 'govtech', 'users', 'metrics'],
  },
  {
    id: 'horizon', name: 'Infinite Horizon', short: 'found the pain · uploads −60%', line: 'eng', x: 800, y: 250, labelUp: false, years: '2024 – now', headline: 'I fixed the cause, not the spinner.',
    problem: 'Slow document uploads were the biggest frustration in the employee portal.',
    insight: 'A nicer loading state would hide the wait. The fix was to remove it.',
    decision: 'Moved uploads to S3 presigned URLs so files skip the app server.',
    result: { big: '−60%', unit: 'upload time' }, tags: ['discovery', 'pain', 'root cause', 'performance', 'internal tools'],
  },
  {
    id: 'maple', name: 'Maple School ERP', short: 'stakeholder interviews · sole owner of scope', line: 'freelance', x: 690, y: 400, labelUp: false, years: '2024 · freelance', headline: 'Three user groups, one product, one owner.',
    problem: 'A school wanted one system for students, teachers and parents.',
    insight: 'Each group cared about different things: attendance, transport, fees.',
    decision: 'Interviewed all three groups and owned the scope end to end.',
    result: { big: '3', unit: 'user groups, one product' }, tags: ['stakeholders', 'interviews', 'scope', 'roadmap', 'edtech', 'prd'],
  },
]

export const QUERIES: { text: string; station: string; proof: string }[] = [
  { text: 'find the real pain before the fix', station: 'horizon', proof: 'uploads −60%' },
  { text: 'map 4 user roles into one product', station: 'power', proof: '5,000+ meters' },
  { text: 'decide what to automate', station: 'icrs', proof: '40% self-serve' },
  { text: 'run stakeholder interviews', station: 'maple', proof: '3 user groups' },
  { text: 'move a funnel metric', station: 'hippo', proof: '+20% onboarding' },
  { text: 'ship for users who read Hindi', station: 'icrs', proof: '2,000+ daily users' },
  { text: 'own the scope end to end', station: 'maple', proof: 'sole owner' },
  { text: 'turn Figma into a shipped spec', station: 'intern', proof: 'design to build' },
  { text: 'talk to engineers in their language', station: 'horizon', proof: 'S3, SSR, caching' },
]

export const EMAIL = 'ujjwaldhariwal0@gmail.com'
