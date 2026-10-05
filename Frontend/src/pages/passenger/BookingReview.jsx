import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { useBooking } from '@/context/BookingContext';
export function BookingReview() {
    const navigate = useNavigate();
    const { selectedTrain, passengers, selectedSeats } = useBooking();
    const trainNumber = selectedTrain?.number || '12951';
    const trainName = selectedTrain?.name || 'Mumbai Rajdhani Express';
    const travelClass = selectedTrain?.class || 'AC 3 Tier (3A)';
    const travellerCount = Math.max(passengers.length, 1);
    const baseRate = 850;
    const baseFare = travellerCount * baseRate;
    const reservationFee = travellerCount * 40;
    const superfastCharge = travellerCount * 30;
    const gst = Math.round(baseFare * 0.05);
    const totalPayable = baseFare + reservationFee + superfastCharge + gst;
    return (<div className="min-h-screen bg-fog/20 pb-20">
      {/* Yatrio Multi-Step Breadcrumb */}
      <div className="border-b border-line bg-white sticky top-16 z-20 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button onClick={() => navigate('/booking/passenger-details')} className="flex items-center gap-2 text-ink hover:text-royal transition-colors cursor-pointer">
              <span className="num size-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                <Check className="size-4 stroke-[2.5]"/>
              </span>
              <span className="text-caption font-semibold text-ink hidden sm:inline">Passengers</span>
            </button>
            <div className="h-0.5 w-12 bg-emerald-500 rounded-full"/>

            <button onClick={() => navigate('/booking/seat-selection')} className="flex items-center gap-2 text-ink hover:text-royal transition-colors cursor-pointer">
              <span className="num size-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                <Check className="size-4 stroke-[2.5]"/>
              </span>
              <span className="text-caption font-semibold text-ink hidden sm:inline">Seats</span>
            </button>
            <div className="h-0.5 w-12 bg-emerald-500 rounded-full"/>

            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-royal text-paper text-xs font-bold flex items-center justify-center ring-4 ring-royal/15">
                3
              </span>
              <span className="text-caption font-bold text-royal">Review</span>
            </div>
            <div className="h-0.5 w-12 bg-line rounded-full"/>

            <div className="flex items-center gap-2 text-ink-muted">
              <span className="num size-7 rounded-full bg-fog text-ink-muted text-xs font-semibold flex items-center justify-center">
                4
              </span>
              <span className="text-caption font-medium hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/booking/seat-selection')} className="mb-6 -ml-2 text-ink-soft hover:text-ink gap-1.5">
          <ArrowLeft className="size-4"/> Back to Seat Selection
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Review Column */}
          <div className="space-y-6">
            <div>
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-royal">
                Step 3 of 4
              </span>
              <h1 className="text-h2 font-bold tracking-tight text-ink mt-0.5">
                Review Your Itinerary
              </h1>
              <p className="text-body text-ink-soft mt-1">
                Please double-check train timings, passenger names, and allocated coach berths before payment.
              </p>
            </div>

            {/* Train / Journey Card */}
            <Card className="p-0 overflow-hidden border-line-mid shadow-card rounded-card">
              <div className="bg-gradient-to-r from-navy via-royal to-azure text-paper p-5 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="num text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                      Superfast Express
                    </span>
                    <span className="text-xs text-paper/80 font-medium">Daily Service</span>
                  </div>
                  <h2 className="text-h3 font-bold mt-1 text-paper">
                    {trainNumber} {trainName}
                  </h2>
                </div>
                <Badge variant="outline" className="border-white/30 text-paper font-semibold bg-white/10">
                  {travelClass} · General Quota
                </Badge>
              </div>

              <div className="p-6 bg-white space-y-6">
                <RouteConnector fromCode="NDLS" toCode="MMCT" fromName="New Delhi Railway Station" toName="Mumbai Central" depTime="16:55" arrTime="08:35" duration="15h 40m" size="lg"/>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line text-sm">
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Departure Date
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">15 Oct 2026</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Platform
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">PF #3</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Distance
                    </span>
                    <span className="font-semibold text-ink mt-0.5 block">1,384 km</span>
                  </div>
                  <div>
                    <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                      Pantry Car
                    </span>
                    <span className="font-semibold text-emerald-700 mt-0.5 block">Available</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Passenger Manifest Card */}
            <Card className="p-6 space-y-4 border-line-mid shadow-card rounded-card">
              <div className="flex justify-between items-center border-b border-line pb-3">
                <h3 className="text-h4 font-bold text-ink">
                  Traveller Manifest ({travellerCount})
                </h3>
                <span className="text-caption text-ink-soft">
                  Assigned Coach B1
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-eyebrow text-ink-soft font-semibold uppercase tracking-[0.16em]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Passenger</th>
                      <th className="py-2.5 px-3">Age / Gender</th>
                      <th className="py-2.5 px-3">Berth Choice</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {passengers.length === 0 ? (<tr>
                        <td className="py-3.5 px-3 num font-bold text-royal">1</td>
                        <td className="py-3.5 px-3 font-semibold text-ink">Primary Passenger</td>
                        <td className="py-3.5 px-3 text-ink-soft">32 / Male</td>
                        <td className="py-3.5 px-3">
                          <span className="num font-semibold text-ink">Coach B1 · 24 (Lower)</span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <Badge variant="success">CONFIRMED</Badge>
                        </td>
                      </tr>) : (passengers.map((p, idx) => {
            const seat = selectedSeats[idx];
            return (<tr key={p.id}>
                            <td className="py-3.5 px-3 num font-bold text-royal">{idx + 1}</td>
                            <td className="py-3.5 px-3 font-semibold text-ink">{p.name || `Passenger ${idx + 1}`}</td>
                            <td className="py-3.5 px-3 text-ink-soft">{p.age || '30'} / {p.gender}</td>
                            <td className="py-3.5 px-3">
                              <span className="num font-semibold text-ink">
                                Coach {seat?.coach || 'B1'} · {seat?.number || `${24 + idx}`} ({seat?.type || p.berthPreference || 'Lower'})
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <Badge variant="success">CONFIRMED</Badge>
                            </td>
                          </tr>);
        }))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Travel Guidelines Alert */}
            <div className="rounded-card border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5"/>
              <div className="space-y-1">
                <span className="font-semibold text-amber-950 block">Important Travel Advisory</span>
                <p className="text-caption text-amber-900/90 leading-relaxed">
                  Passengers must carry original photo ID during the journey. Cancellation charges apply as per Ministry of Railways refund rules.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Fare Breakdown */}
          <aside className="space-y-4 sticky top-28">
            <Card className="p-6 space-y-6 border-line-mid shadow-raised rounded-card">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Payment Summary
                </span>
                <h3 className="text-h4 font-bold text-ink mt-0.5">
                  Fare Breakdown
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Base Fare ({travellerCount} traveller{travellerCount > 1 ? 's' : ''})</span>
                  <span className="num font-semibold text-ink">₹{baseFare}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Reservation Charges</span>
                  <span className="num font-semibold text-ink">₹{reservationFee}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Superfast Surcharge</span>
                  <span className="num font-semibold text-ink">₹{superfastCharge}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Goods & Services Tax (GST 5%)</span>
                  <span className="num font-semibold text-ink">₹{gst}</span>
                </div>

                <div className="border-t border-line-strong border-dashed pt-4 flex justify-between items-baseline">
                  <div>
                    <span className="text-body font-bold text-ink block">Total Payable</span>
                    <span className="text-[11px] text-ink-muted">All taxes included</span>
                  </div>
                  <span className="num text-h2 font-black text-royal">
                    ₹{totalPayable}
                  </span>
                </div>
              </div>

              <Button onClick={() => navigate('/booking/payment')} size="lg" className="w-full">
                Proceed to Payment
                <ArrowRight className="size-4"/>
              </Button>

              <div className="flex items-center justify-center gap-2 text-caption text-ink-muted">
                <ShieldCheck className="size-4 text-emerald-600"/>
                <span>256-bit encrypted checkout</span>
              </div>
            </Card>

            {/* Demo Notice */}
            <div className="rounded-card border border-azure/20 bg-blue-100 p-4 text-caption text-body flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-royal shrink-0 mt-0.5"/>
              <p>
                <b className="font-semibold text-royal">Demo Sandbox Mode:</b> No real credit card or bank debit will occur. Instant simulated confirmation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>);
}
