import {useState} from 'react'
import logoWhite from './assets/brand/logo-white.png'
import logoMonoWhite from './assets/brand/logo-mono-white.png'
import logoMonoNavy from './assets/brand/logo-mono-navy.png'
import  Booking from './pages/Booking.jsx'

const checks = [
  { label: 'Vite dev server', detail: 'vite 8 + @vitejs/plugin-react' },
  { label: 'Tailwind CSS v4', detail: 'via @tailwindcss/vite plugin' },
  { label: 'Brand kit wired', detail: 'Poppins + Yatrio palette from /brandkit' },
]

function App() {
  const [showBooking,setShowBooking]=useState(false)
  if(showBooking){
    return <Booking/>
  }
  return (
    
    <div className="min-h-screen bg-ink font-display text-white">
      {/* Velocity gradient edge — buttons/progress treatment from board 03 */}
      <div className="h-1.5 w-full bg-gradient-to-r from-royal via-azure to-sky" />

      <main className="relative mx-auto flex min-h-[calc(100vh-6px)] w-full max-w-2xl flex-col items-center justify-center gap-10 px-6 py-16">
        {/* subtle blueprint grid, straight from the brand boards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,179,253,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(59,179,253,0.07)_1px,transparent_1px)] bg-[size:44px_44px]"
        />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <img
            src={logoMonoWhite}
            alt="Yatrio monogram"
            className="h-20 w-auto"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to <span className="text-azure">Yatrio</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            Hey team — if this page renders in Yatrio blues with Poppins type,
            the Vite + Tailwind CSS setup is verified end to end.
          </p>
        </div>

        <section className="relative w-full space-y-3">
          {checks.map(({ label, detail }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors hover:border-sky/40"
            >
              <div>
                <p className="font-semibold text-white">{label}</p>
                <p className="text-sm text-white/60">{detail}</p>
              </div>
              <span className="flex size-6 items-center justify-center rounded-full bg-status-success/15 text-sm text-status-success">
                ✓
              </span>
            </div>
          ))}
        </section>

        <div className="relative flex flex-wrap items-center justify-center gap-6">
          {/* navy ink on white — the approved light-surface lockup (board 02) */}
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-3">
            <img src={logoMonoNavy} alt="Yatrio monogram, navy on white" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-ink">on light surfaces</span>
          </div>
          {/* white knockout on ink — the default dark-surface lockup */}
          <img src={logoWhite} alt="Yatrio wordmark, white" className="h-12 w-auto" />
        </div>

        <button
           type="button"
           onClick={() => setShowBooking(true)}
           className="relative rounded-xl bg-azure px-6 py-3 font-semibold text-ink transition hover:bg-sky"
        >
  Open Railway Booking →
</button>
        <footer className="relative text-center text-sm text-white/50">
          Edit <code className="rounded bg-white/10 px-1.5 py-0.5 text-sky">src/App.jsx</code>{' '}
          and save to test hot reload.
        </footer>
      </main>
    </div>
  )
}

export default App
