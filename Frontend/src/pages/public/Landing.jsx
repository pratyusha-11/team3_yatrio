import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatTile } from '@/components/ui/StatTile';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { useBooking } from '@/context/BookingContext';
export function Landing() {
    const navigate = useNavigate();
    const { setSearchParams } = useBooking();
    const [fromStation, setFromStation] = useState('New Delhi (NDLS)');
    const [toStation, setToStation] = useState('Mumbai Central (MMCT)');
    const [journeyDate, setJourneyDate] = useState('2026-10-15');
    const [selectedClass, setSelectedClass] = useState('3A');
    const handleSwap = () => {
        const temp = fromStation;
        setFromStation(toStation);
        setToStation(temp);
    };
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({
            fromStation,
            toStation,
            date: journeyDate,
            class: selectedClass,
            passengers: 1,
        });
        navigate(`/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&date=${journeyDate}&class=${selectedClass}`);
    };
    return (<div className="w-full">
      {/* 1. HERO SECTION — Horizon Gradient + Blueprint Grid */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#04275B_0%,#014CA9_78%,#0A63C6_100%)] pt-16 pb-28 text-white blueprint">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky/35 bg-sky/12 px-3 py-1.5 text-caption font-semibold text-sky-bright mb-6">
            <span className="size-1.5 animate-pulse rounded-full bg-sky"/>
            Yatrio Engine v2.4 · Real-time rail platform
          </div>

          <h1 className="mx-auto max-w-4xl text-display font-bold tracking-tight text-white leading-tight">
            Rail journeys, reimagined in motion.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lead text-on-dark-soft">
            Live train tracking, honest timings, and booking that feels as fast as the train itself.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/search')} className="shadow-raised">
              Book a Train
              <ArrowRight className="size-4"/>
            </Button>
            <Button variant="darkSecondary" size="lg" onClick={() => navigate('/pnr')}>
              Check PNR Status
            </Button>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE SEARCH FORM — Overlaps hero seam (-mt-12) */}
      <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <form onSubmit={handleSearch} className="rounded-card border border-line-mid bg-white p-5 shadow-raised transition-shadow hover:shadow-panel">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto_1.5fr_1.2fr_1fr_auto] lg:items-end">
            {/* From Station */}
            <div className="space-y-1.5">
              <label htmlFor="from-station" className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Origin Station
              </label>
              <input id="from-station" type="text" value={fromStation} onChange={(e) => setFromStation(e.target.value)} placeholder="Station name or code" required className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15"/>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center pb-0.5">
              <button type="button" onClick={handleSwap} aria-label="Swap origin and destination" className="size-11 flex items-center justify-center rounded-control border border-line-strong bg-white text-ink-soft hover:text-royal hover:border-royal transition-colors">
                <ArrowLeftRight className="size-4"/>
              </button>
            </div>

            {/* To Station */}
            <div className="space-y-1.5">
              <label htmlFor="to-station" className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Destination Station
              </label>
              <input id="to-station" type="text" value={toStation} onChange={(e) => setToStation(e.target.value)} placeholder="Station name or code" required className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15"/>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="journey-date" className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Date of Journey
              </label>
              <input id="journey-date" type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} required className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15"/>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label htmlFor="class-select" className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Travel Class
              </label>
              <select id="class-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="h-11 w-full rounded-control border border-line-strong bg-white px-3 text-sm font-medium text-ink focus:border-royal focus:outline-none focus:ring-4 focus:ring-royal/15 cursor-pointer">
                <option value="1A">1A · First AC</option>
                <option value="2A">2A · AC 2 Tier</option>
                <option value="3A">3A · AC 3 Tier</option>
                <option value="SL">SL · Sleeper</option>
                <option value="CC">CC · Chair Car</option>
              </select>
            </div>

            {/* Submit */}
            <div>
              <Button type="submit" size="md" className="w-full lg:w-auto h-11 px-6">
                Search Trains
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. STAT STRIP — 4 × StatTile */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Trains Running" value="12,480" delta="+3.2%"/>
            <StatTile label="On-Time Precision" value="98.4%" delta="+0.6%"/>
            <StatTile label="Daily Passengers" value="2.4M" delta="+5.1%"/>
            <StatTile label="Connected Routes" value="1,840" delta="All India"/>
          </div>
        </div>
      </section>

      {/* 4. LIVE TRAIN STATUS PREVIEW — Dark Band */}
      <section className="bg-ink py-16 text-white border-y border-white/10 blueprint">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-sky-bright">
                Engine Telemetry
              </span>
              <h2 className="text-h2 font-bold tracking-tight text-white mt-1">
                Live railway network
              </h2>
            </div>
            <Badge variant="success" showDot pulseDot size="md">
              Network Operating Normal
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
            {
                number: '12951',
                name: 'Mumbai Rajdhani',
                from: 'NDLS',
                to: 'MMCT',
                speed: '130 km/h',
                status: 'On Time',
                dep: '16:55',
                arr: '08:35',
            },
            {
                number: '12009',
                name: 'Shatabdi Express',
                from: 'BCT',
                to: 'ADI',
                speed: '115 km/h',
                status: 'On Time',
                dep: '06:20',
                arr: '12:55',
            },
            {
                number: '22119',
                name: 'Tejas Express',
                from: 'CSMT',
                to: 'MAO',
                speed: '120 km/h',
                status: 'Delayed · 8m',
                dep: '05:50',
                arr: '14:00',
            },
        ].map((train) => (<div key={train.number} className="rounded-card border border-white/10 bg-panel p-5 space-y-4 hover:border-royal/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-h4 font-semibold text-white">
                      {train.number} {train.name}
                    </h3>
                  </div>
                  <span className="num text-caption font-semibold text-sky-bright">
                    {train.speed}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="num text-xl font-bold text-white">{train.from}</span>
                  <span className="relative h-0.5 flex-1 bg-gradient-to-r from-royal to-sky after:absolute after:-right-px after:-top-[3px] after:border-y-[4px] after:border-r-[6px] after:border-y-transparent after:border-r-sky"/>
                  <span className="num text-xl font-bold text-white">{train.to}</span>
                </div>

                <div className="flex items-center justify-between text-caption text-on-dark-soft pt-2 border-t border-white/10">
                  <span className="num">Dep: {train.dep} · Arr: {train.arr}</span>
                  <span className={train.status.includes('Delayed') ? 'text-error-strong font-semibold' : 'text-sky-bright'}>
                    {train.status}
                  </span>
                </div>
              </div>))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS — Numbered Steps */}
      <section className="py-16 md:py-20 bg-paper">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Engineered Efficiency
          </span>
          <h2 className="text-h2 font-bold tracking-tight text-ink mt-1 mb-12">
            Built for velocity
          </h2>

          <div className="grid gap-8 md:grid-cols-3 text-left">
            {[
            {
                step: '01',
                title: 'Instant Search',
                desc: 'Locate trains between any station pair with live seat availability and honest delay predictions.',
            },
            {
                step: '02',
                title: 'Seamless Passenger Flow',
                desc: 'Add passenger details once, select berths visually on coach blueprints, and review transparent fares.',
            },
            {
                step: '03',
                title: 'Instant Gate-Ready Ticket',
                desc: 'Complete simulated test checkout and receive an authentic digital ticket with scannable barcode.',
            },
        ].map((item) => (<Card key={item.step} className="p-6 relative overflow-hidden">
                <span className="num text-display font-bold text-royal/15 absolute right-4 top-2 select-none">
                  {item.step}
                </span>
                <div className="size-10 rounded-control bg-royal/10 text-royal flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-h4 font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-body text-ink-soft">{item.desc}</p>
              </Card>))}
          </div>
        </div>
      </section>

      {/* 6. POPULAR ROUTES */}
      <section className="py-16 bg-white border-t border-line-mid">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Network Corridors
              </span>
              <h2 className="text-h2 font-bold tracking-tight text-ink mt-1">
                Frequently travelled routes
              </h2>
            </div>
            <Link to="/search" className="text-sm font-semibold text-royal hover:text-azure">
              View all corridors →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
            { from: 'NDLS', to: 'MMCT', fromName: 'New Delhi', toName: 'Mumbai Central', fare: 820, time: '15h 40m', trains: 14 },
            { from: 'MMCT', to: 'PUNE', fromName: 'Mumbai', toName: 'Pune Junction', fare: 340, time: '03h 35m', trains: 22 },
            { from: 'HWH', to: 'NDLS', fromName: 'Howrah', toName: 'New Delhi', fare: 950, time: '17h 15m', trains: 10 },
            { from: 'SBC', to: 'MAS', fromName: 'Bengaluru', toName: 'Chennai Central', fare: 480, time: '05h 00m', trains: 16 },
        ].map((route) => (<div key={`${route.from}-${route.to}`} onClick={() => navigate(`/search?from=${route.fromName}&to=${route.toName}`)} className="group rounded-card border border-line-mid bg-white p-5 shadow-card hover:shadow-raised hover:border-royal/30 transition-all cursor-pointer">
                <RouteConnector fromCode={route.from} toCode={route.to} fromName={route.fromName} toName={route.toName} duration={route.time} size="sm"/>
                <div className="mt-4 pt-3 border-t border-line flex justify-between items-center text-sm">
                  <span className="text-caption text-ink-soft">{route.trains} trains daily</span>
                  <span className="num font-bold text-royal">From ₹{route.fare}</span>
                </div>
              </div>))}
          </div>
        </div>
      </section>

      {/* 7. CTA BAND — Horizon Gradient */}
      <section className="bg-[linear-gradient(135deg,#04275B_0%,#014CA9_78%,#0A63C6_100%)] py-16 text-white text-center blueprint">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-bold tracking-tight text-white max-w-2xl mx-auto">
            Ready for your next journey?
          </h2>
          <p className="mt-3 text-lead text-on-dark-soft max-w-xl mx-auto">
            Book now with instantaneous confirmation, seat maps, and honest timings.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="primaryInverted" onClick={() => navigate('/search')} className="px-8 shadow-raised">
              Search Trains Now
              <ArrowRight className="size-4"/>
            </Button>
          </div>
        </div>
      </section>
    </div>);
}
