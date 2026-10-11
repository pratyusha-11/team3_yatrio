import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { Logo } from '@/components/layout/Logo';
export function BookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const booking = {
        pnr: '2849105832',
        status: 'CONFIRMED',
        trainNo: '12951',
        trainName: 'Mumbai Rajdhani Express',
        date: '15 Oct 2026',
        fromCode: 'NDLS',
        toCode: 'MMCT',
        fromName: 'New Delhi',
        toName: 'Mumbai Central',
        depTime: '16:55',
        arrTime: '08:35',
        duration: '15h 40m',
        class: 'AC 3 Tier (3A)',
        quota: 'General Quota',
        distance: '1,384 km',
        bookedOn: '02 Oct 2026, 14:30',
        passengers: [
            { name: 'Rahul Sharma', age: 32, gender: 'M', coach: 'B1', seat: '24', berth: 'Lower', status: 'CNF' },
            { name: 'Priya Sharma', age: 28, gender: 'F', coach: 'B1', seat: '25', berth: 'Middle', status: 'CNF' },
        ],
        fare: {
            base: 1400, res: 80, sf: 60, gst: 100, total: 1640
        },
        payment: {
            method: 'UPI', id: 'UPI-9876543210-YTR', date: '02 Oct 2026'
        }
    };
    return (<div className="min-h-screen bg-fog/20 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/bookings')} className="-ml-2 text-ink-soft hover:text-ink gap-1.5">
            <ArrowLeft className="size-4"/> Back to My Bookings
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4 mr-1.5"/> Print
            </Button>
            <Button size="sm" onClick={() => window.print()} className="gap-1.5">
              <Download className="size-4"/> Download e-Ticket
            </Button>
          </div>
        </div>

        {/* Detailed Boarding Pass */}
        <div className="relative rounded-ticket bg-white border border-line-mid shadow-ticket overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-navy via-royal to-azure text-paper p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Logo variant="dark" size="sm"/>
                <span className="text-xs uppercase tracking-widest text-sky font-semibold px-2 py-0.5 rounded bg-white/10">
                  Electronic Reservation Slip (ERS)
                </span>
              </div>
              <div className="text-caption text-paper/80 font-medium pt-1">
                Booking ID: {id || 'BKG-2849105'} · Booked On {booking.bookedOn}
              </div>
            </div>

            <div className="text-right">
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-paper/75 block">
                PNR Number
              </span>
              <span className="num font-mono text-2xl md:text-3xl font-black tracking-widest text-paper block">
                {booking.pnr}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line">
              <div>
                <h3 className="text-h3 font-bold text-ink">
                  {booking.trainNo} {booking.trainName}
                </h3>
                <span className="text-caption text-ink-soft">
                  {booking.class} · {booking.quota}
                </span>
              </div>
              <Badge variant="success" className="text-xs font-bold px-3 py-1">
                CONFIRMED (CNF)
              </Badge>
            </div>

            <RouteConnector fromCode={booking.fromCode} toCode={booking.toCode} fromName={booking.fromName} toName={booking.toName} depTime={booking.depTime} arrTime={booking.arrTime} duration={booking.duration} size="lg"/>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 rounded-card bg-fog/30 border border-line text-sm">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                  Date
                </span>
                <span className="num font-bold text-ink mt-0.5 block">{booking.date}</span>
              </div>
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                  Distance
                </span>
                <span className="font-semibold text-ink mt-0.5 block">{booking.distance}</span>
              </div>
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                  Payment Mode
                </span>
                <span className="font-semibold text-ink mt-0.5 block">{booking.payment.method}</span>
              </div>
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                  Total Paid
                </span>
                <span className="num font-bold text-royal mt-0.5 block">₹{booking.fare.total}</span>
              </div>
            </div>

            {/* Passenger List */}
            <div className="space-y-3 pt-2">
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                Passengers
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line text-eyebrow text-ink-soft font-semibold uppercase tracking-[0.16em]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Age / Sex</th>
                      <th className="py-2.5 px-3">Coach / Seat</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {booking.passengers.map((p, i) => (<tr key={i}>
                        <td className="py-3 px-3 num font-bold text-royal">{i + 1}</td>
                        <td className="py-3 px-3 font-semibold text-ink">{p.name}</td>
                        <td className="py-3 px-3 text-ink-soft">{p.age} / {p.gender}</td>
                        <td className="py-3 px-3 num font-semibold text-ink">
                          Coach {p.coach} · {p.seat} ({p.berth})
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Badge variant="success">CONFIRMED</Badge>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="pt-4 border-t border-line space-y-2 text-sm">
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft block">
                Fare Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-caption">
                <div>
                  <span className="text-ink-soft block">Base Fare:</span>
                  <span className="num font-bold text-ink">₹{booking.fare.base}</span>
                </div>
                <div>
                  <span className="text-ink-soft block">Reservation & Superfast:</span>
                  <span className="num font-bold text-ink">₹{booking.fare.res + booking.fare.sf}</span>
                </div>
                <div>
                  <span className="text-ink-soft block">GST (5%):</span>
                  <span className="num font-bold text-ink">₹{booking.fare.gst}</span>
                </div>
                <div>
                  <span className="text-ink-soft block">Grand Total:</span>
                  <span className="num font-bold text-royal text-base">₹{booking.fare.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="rounded-card border border-azure/20 bg-blue-100 p-4 text-caption text-body flex items-start gap-2.5">
          <Info className="size-4 text-royal shrink-0 mt-0.5"/>
          <p>
            <b className="font-semibold text-royal">Demo Mode — Simulated Ticket:</b> Not valid for actual travel on Indian Railways tracks.
          </p>
        </div>
      </div>
    </div>);
}
