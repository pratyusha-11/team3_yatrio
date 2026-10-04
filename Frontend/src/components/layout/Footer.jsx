import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
export function Footer() {
    return (<footer className="border-t border-white/10 bg-ink text-on-dark-soft">
      <div className="mx-auto grid w-full max-w-content gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <Logo size="md" variant="dark" showTagline/>
          <p className="text-sm text-on-dark-soft leading-relaxed max-w-sm">
            Live train tracking, honest timings, and booking that feels as fast as the train itself.
          </p>
          <div className="inline-flex items-center gap-2 rounded-control bg-white/5 border border-white/10 px-3 py-1.5 text-caption text-sky-bright">
            <span className="size-1.5 rounded-full bg-sky"/>
            <span>MERN / Node.js · Razorpay Test Mode</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-dark-label mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/search" className="hover:text-white transition-colors">Book Trains</Link></li>
            <li><Link to="/pnr" className="hover:text-white transition-colors">PNR Status</Link></li>
            <li><Link to="/trains" className="hover:text-white transition-colors">Train Directory</Link></li>
            <li><Link to="/bookings" className="hover:text-white transition-colors">My Trips</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-dark-label mb-4">
            Passenger Guide
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="text-on-dark-soft">Cancellation Rules</span></li>
            <li><span className="text-on-dark-soft">Tatkal & Premium</span></li>
            <li><span className="text-on-dark-soft">Concessions</span></li>
            <li><span className="text-on-dark-soft">Baggage Guidelines</span></li>
          </ul>
        </div>

        {/* Legal & Security */}
        <div>
          <h4 className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-on-dark-label mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="text-on-dark-soft">Security Standards</span></li>
            <li><span className="text-on-dark-soft">Privacy Policy</span></li>
            <li><span className="text-on-dark-soft">Terms of Service</span></li>
            <li><Link to="/admin" className="text-sky-bright hover:underline">Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* Mandatory Demo-Mode Subfooter */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-content flex-col gap-2 px-4 py-6 text-caption text-on-dark-label sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Yatrio. Demo project — no real IRCTC bookings are made.</p>
          <p className="num text-on-dark-soft">Engineered for speed · Move Beyond Limits</p>
        </div>
      </div>
    </footer>);
}
