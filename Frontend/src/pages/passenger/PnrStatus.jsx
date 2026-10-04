import React, { useState } from 'react';
import { Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RouteConnector } from '@/components/ui/RouteConnector';
export function PnrStatus() {
    const [pnr, setPnr] = useState('');
    const [status, setStatus] = useState('idle');
    const handleSearch = (e) => {
        e.preventDefault();
        if (pnr.length !== 10)
            return;
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
        }, 1000);
    };
    return (<div className="min-h-screen bg-fog/25 py-12 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* PNR Search Hero Card */}
        <div className="rounded-card bg-gradient-to-r from-navy via-royal to-navy p-8 md:p-10 text-paper shadow-card relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto text-center space-y-3">
            <span className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-sky block">
              Direct Railway Telemetry
            </span>
            <h1 className="text-display font-extrabold tracking-tight text-paper">
              Check Live PNR Status
            </h1>
            <p className="text-body text-paper/80">
              Get real-time reservation charts, coach allocation, berth confirmation, and departure updates.
            </p>

            <form onSubmit={handleSearch} className="pt-4 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input placeholder="10-digit PNR number" value={pnr} onChange={(e) => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))} className="num text-center tracking-widest text-lg font-bold bg-white text-ink border-0 h-12 shadow-raised" maxLength={10}/>
              <Button type="submit" disabled={pnr.length !== 10 || status === 'loading'} size="lg" className="shrink-0 h-12 font-bold px-8 shadow-raised">
                {status === 'loading' ? 'Verifying...' : 'Check Status'}
              </Button>
            </form>
          </div>
        </div>

        {/* Demo Quick Fill for Reviewer */}
        {status === 'idle' && (<div className="text-center text-caption text-ink-soft">
            Quick demo: click to test with sample PNR{' '}
            <button onClick={() => { setPnr('2849105832'); setStatus('success'); }} className="text-royal font-semibold hover:underline cursor-pointer num">
              2849105832
            </button>
          </div>)}

        {/* PNR Live Results */}
        {status === 'success' && (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <Card className="p-0 overflow-hidden border-line-mid shadow-card rounded-card">
              {/* Top Banner */}
              <div className="bg-paper p-6 border-b border-line flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                    Current Reservation Status
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="num font-mono text-2xl font-bold tracking-widest text-ink">
                      {pnr.slice(0, 4)}-{pnr.slice(4, 7)}-{pnr.slice(7)}
                    </span>
                    <Badge variant="success">CONFIRMED (CNF)</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="size-4 mr-1.5"/> Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="size-4 mr-1.5"/> Share
                  </Button>
                </div>
              </div>

              {/* Journey Details */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-h3 font-bold text-ink">
                    12951 Mumbai Rajdhani Express
                  </h3>
                  <span className="text-caption text-ink-soft">
                    Superfast Express · AC 3 Tier (3A) · General Quota
                  </span>
                </div>

                <RouteConnector fromCode="NDLS" toCode="MMCT" fromName="New Delhi" toName="Mumbai Central" depTime="16:55" arrTime="08:35" duration="15h 40m" size="lg"/>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line text-sm">
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Date of Journey
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">15 Oct 2026</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Boarding Station
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">New Delhi (NDLS)</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Chart Status
                    </span>
                    <span className="font-semibold text-emerald-700 mt-0.5 block">CHART PREPARED</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Platform #
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">Platform 3</span>
                  </div>
                </div>

                {/* Passenger Breakdown Table */}
                <div className="pt-4 border-t border-line space-y-3">
                  <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                    Passenger Breakdown
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-line text-eyebrow text-ink-soft font-semibold uppercase tracking-[0.16em]">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Booking Status</th>
                          <th className="py-2.5 px-3">Current Status</th>
                          <th className="py-2.5 px-3 text-right">Allocated Berth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-sm">
                        <tr>
                          <td className="py-3 px-3 num font-bold text-royal">Passenger 1</td>
                          <td className="py-3 px-3">
                            <span className="text-caption font-semibold px-2 py-0.5 rounded bg-fog text-ink">
                              CNF / B1 / 24
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="success">CONFIRMED</Badge>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-ink num">
                            Coach B1 · Berth 24 (Lower)
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 num font-bold text-royal">Passenger 2</td>
                          <td className="py-3 px-3">
                            <span className="text-caption font-semibold px-2 py-0.5 rounded bg-fog text-ink">
                              CNF / B1 / 25
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="success">CONFIRMED</Badge>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-ink num">
                            Coach B1 · Berth 25 (Middle)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>
          </div>)}
      </div>
    </div>);
}
