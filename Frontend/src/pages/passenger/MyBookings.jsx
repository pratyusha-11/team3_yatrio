import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { cn } from '@/lib/utils';
export function MyBookings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const bookings = [
        {
            id: 'BKG-2849105',
            pnr: '2849105832',
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
            status: 'CONFIRMED',
            fare: 1640,
            passengers: 2,
            classType: '3A',
            type: 'upcoming',
        },
        {
            id: 'BKG-1928374',
            pnr: '1928374650',
            trainNo: '12009',
            trainName: 'Mumbai Ahmedabad Shatabdi',
            date: '02 Sep 2026',
            fromCode: 'MMCT',
            toCode: 'ADI',
            fromName: 'Mumbai Central',
            toName: 'Ahmedabad Jn',
            depTime: '06:20',
            arrTime: '12:45',
            duration: '06h 25m',
            status: 'COMPLETED',
            fare: 1120,
            passengers: 1,
            classType: 'CC',
            type: 'completed',
        },
        {
            id: 'BKG-5432109',
            pnr: '5432109876',
            trainNo: '22119',
            trainName: 'Tejas Express',
            date: '18 Aug 2026',
            fromCode: 'CSMT',
            toCode: 'MAO',
            fromName: 'Mumbai CSMT',
            toName: 'Madgaon (Goa)',
            depTime: '05:50',
            arrTime: '14:00',
            duration: '08h 10m',
            status: 'CANCELLED',
            fare: 1850,
            passengers: 1,
            classType: 'CC',
            type: 'cancelled',
        },
    ];
    const filtered = bookings.filter(b => b.type === activeTab);
    const handleCancelClick = (b) => {
        setSelectedBooking(b);
        setCancelModalOpen(true);
    };
    const handleConfirmCancel = () => {
        setCancelModalOpen(false);
        setSelectedBooking(null);
    };
    return (<div className="min-h-screen bg-fog/20 py-10 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-royal">
            Booking History
          </span>
          <h1 className="text-h2 font-bold tracking-tight text-ink mt-0.5">
            My Travel Itineraries
          </h1>
          <p className="text-body text-ink-soft mt-1">
            Track confirmed tickets, review e-reservation slips, or cancel upcoming journeys.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-line gap-2">
          {[
            { id: 'upcoming', label: 'Upcoming Journeys' },
            { id: 'completed', label: 'Completed Travels' },
            { id: 'cancelled', label: 'Cancelled & Refunds' },
        ].map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer", activeTab === tab.id
                ? "border-royal text-royal"
                : "border-transparent text-ink-soft hover:text-ink hover:border-line-strong")}>
              {tab.label}
            </button>))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (<Card className="p-12 text-center border-dashed border-line-strong rounded-card">
              <Train className="size-12 text-ink-muted mx-auto mb-3 opacity-40"/>
              <h3 className="text-h4 font-bold text-ink mb-1">
                No {activeTab} bookings found
              </h3>
              <p className="text-caption text-ink-soft max-w-sm mx-auto mb-6">
                You have no journeys matching this filter currently recorded in your account.
              </p>
              <Button onClick={() => navigate('/')}>Book a Journey</Button>
            </Card>) : (filtered.map(booking => (<Card key={booking.id} className="p-6 border-line-mid shadow-card hover:shadow-raised transition-all rounded-card space-y-5 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <span className="num font-mono text-sm font-bold bg-fog/60 px-2.5 py-1 rounded border border-line text-ink">
                      PNR: {booking.pnr}
                    </span>
                    <Badge variant={booking.status === 'CONFIRMED'
                ? 'success'
                : booking.status === 'COMPLETED'
                    ? 'outline'
                    : 'error'}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="text-caption text-ink-soft">
                    Travel Date: <b className="text-ink font-semibold">{booking.date}</b>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="text-h4 font-bold text-ink">
                        {booking.trainNo} {booking.trainName}
                      </h3>
                      <span className="text-caption text-ink-soft">
                        Class: {booking.classType} · {booking.passengers} Passenger{booking.passengers > 1 ? 's' : ''}
                      </span>
                    </div>

                    <RouteConnector fromCode={booking.fromCode} toCode={booking.toCode} fromName={booking.fromName} toName={booking.toName} depTime={booking.depTime} arrTime={booking.arrTime} duration={booking.duration} size="sm"/>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-line">
                    <div className="text-left lg:text-right">
                      <span className="text-eyebrow uppercase text-ink-soft block font-semibold">
                        Total Fare
                      </span>
                      <span className="num text-h3 font-black text-royal block">
                        ₹{booking.fare}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)} className="gap-1.5">
                        <Eye className="size-4"/> View e-Ticket
                      </Button>

                      {booking.type === 'upcoming' && (<Button variant="ghost" size="sm" onClick={() => handleCancelClick(booking)} className="text-error-strong hover:bg-red-50 hover:text-red-700">
                          Cancel
                        </Button>)}
                    </div>
                  </div>
                </div>
              </Card>)))}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Confirm Journey Cancellation">
        <div className="space-y-4">
          <p className="text-sm text-ink-soft">
            Are you sure you want to cancel ticket for{' '}
            <b className="text-ink">{selectedBooking?.trainNo} {selectedBooking?.trainName}</b>{' '}
            (PNR: <span className="num font-bold">{selectedBooking?.pnr}</span>)?
          </p>

          <div className="rounded-card bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-1">
            <span className="font-semibold block">Clerkage & Cancellation Charges:</span>
            <p>A standard deduction of ₹120 per passenger applies as per Indian Railways rules.</p>
            <p className="font-bold pt-1">
              Estimated Refund: ₹{Math.max((selectedBooking?.fare || 0) - 240, 0)} (Processed within 3-5 business days).
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              Keep Ticket
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>);
}
