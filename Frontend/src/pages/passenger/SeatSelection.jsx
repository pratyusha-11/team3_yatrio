import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';
export function SeatSelection() {
    const navigate = useNavigate();
    const { selectedTrain, passengers, selectedSeats, addSeat, removeSeat } = useBooking();
    const [activeCoach, setActiveCoach] = useState('B1');
    const coaches = [
        { id: 'B1', type: '3A', available: 12 },
        { id: 'B2', type: '3A', available: 18 },
        { id: 'B3', type: '3A', available: 5 },
        { id: 'B4', type: '3A', available: 0 },
    ];
    // 64 seats for 3A coach (8 bays x 8 seats)
    const [seats] = useState(() => {
        const list = [];
        for (let i = 1; i <= 64; i++) {
            let type = 'Lower';
            let shortType = 'L';
            const rem = i % 8;
            if (rem === 1 || rem === 4) {
                type = 'Lower';
                shortType = 'L';
            }
            else if (rem === 2 || rem === 5) {
                type = 'Middle';
                shortType = 'M';
            }
            else if (rem === 3 || rem === 6) {
                type = 'Upper';
                shortType = 'U';
            }
            else if (rem === 7) {
                type = 'Side Lower';
                shortType = 'SL';
            }
            else if (rem === 0) {
                type = 'Side Upper';
                shortType = 'SU';
            }
            let status = 'available';
            if (i % 5 === 0)
                status = 'occupied';
            if (i === 12 || i === 13)
                status = 'reserved';
            list.push({ number: i, type, shortType, status });
        }
        return list;
    });
    const maxSeats = Math.max(passengers.length, 1);
    const currentSelectedSeatNumbers = selectedSeats.map(s => Number(s.number));
    const toggleSeat = (seatNum, seatType) => {
        const seatObj = seats.find(s => s.number === seatNum);
        if (!seatObj || seatObj.status !== 'available')
            return;
        if (currentSelectedSeatNumbers.includes(seatNum)) {
            removeSeat(String(seatNum));
        }
        else {
            if (currentSelectedSeatNumbers.length < maxSeats) {
                addSeat({ coach: activeCoach, number: String(seatNum), type: seatType });
            }
            else {
                // Replace first if at capacity or alert
                removeSeat(String(currentSelectedSeatNumbers[0]));
                addSeat({ coach: activeCoach, number: String(seatNum), type: seatType });
            }
        }
    };
    const handleContinue = () => {
        navigate('/booking/review');
    };
    const trainNumber = selectedTrain?.number || '12951';
    const trainName = selectedTrain?.name || 'Mumbai Rajdhani Express';
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

            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-royal text-paper text-xs font-bold flex items-center justify-center ring-4 ring-royal/15">
                2
              </span>
              <span className="text-caption font-bold text-royal">Seat Selection</span>
            </div>
            <div className="h-0.5 w-12 bg-line rounded-full"/>

            <div className="flex items-center gap-2 text-ink-muted">
              <span className="num size-7 rounded-full bg-fog text-ink-muted text-xs font-semibold flex items-center justify-center">
                3
              </span>
              <span className="text-caption font-medium hidden sm:inline">Review</span>
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/booking/passenger-details')} className="mb-6 -ml-2 text-ink-soft hover:text-ink gap-1.5">
          <ArrowLeft className="size-4"/> Back to Passenger Details
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Main Coach Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-card border border-line-mid p-5 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-royal">
                  Interactive Coach Bay
                </span>
                <h1 className="text-h3 font-bold text-ink mt-0.5">
                  Choose Your Berths
                </h1>
                <p className="text-caption text-ink-soft mt-0.5">
                  {trainNumber} {trainName} · Select {maxSeats} seat{maxSeats > 1 ? 's' : ''}
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-caption font-medium bg-fog/40 px-3.5 py-2 rounded-control border border-line">
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded-sm border border-line-strong bg-white shadow-xs"/>
                  <span className="text-ink-soft">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded-sm bg-royal text-paper flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span className="text-ink font-semibold">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded-sm bg-fog-strong text-ink-muted"/>
                  <span className="text-ink-muted">Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-4 rounded-sm bg-sky-light/80 border border-sky/30"/>
                  <span className="text-sky-dark">Reserved</span>
                </div>
              </div>
            </div>

            {/* Coach Tabs */}
            <div className="space-y-2">
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Select Coach
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {coaches.map(coach => (<button key={coach.id} onClick={() => setActiveCoach(coach.id)} disabled={coach.available === 0} className={cn("min-w-[100px] p-3 rounded-card border text-left transition-all shrink-0 cursor-pointer", activeCoach === coach.id
                ? "border-royal bg-royal/5 ring-2 ring-royal/20 shadow-xs"
                : "border-line bg-white hover:border-line-strong hover:bg-fog/30", coach.available === 0 && "opacity-45 cursor-not-allowed hover:border-line")}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-base">{coach.id}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-fog text-ink-soft">
                        {coach.type}
                      </span>
                    </div>
                    <div className="text-caption text-ink-soft mt-1">
                      {coach.available > 0 ? (<span className="text-emerald-700 font-semibold">{coach.available} berths free</span>) : (<span className="text-error-strong font-medium">Full</span>)}
                    </div>
                  </button>))}
              </div>
            </div>

            {/* Coach Visual Map */}
            <Card className="p-6 overflow-x-auto bg-fog/40 border-line-mid shadow-card rounded-card relative">
              <div className="min-w-[760px] bg-white rounded-card p-6 border border-line-strong shadow-raised my-2 relative">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-navy text-paper uppercase tracking-wider">
                      Coach {activeCoach}
                    </span>
                    <span className="text-caption text-ink-soft">Layout: 8 Passenger Bays</span>
                  </div>
                  <span className="text-caption font-mono text-ink-muted">Aisle Side ➔</span>
                </div>

                <div className="grid grid-cols-8 gap-4 justify-between">
                  {Array.from({ length: 8 }).map((_, bayIndex) => {
            const mainSeats = seats.slice(bayIndex * 8, bayIndex * 8 + 6);
            const sideSeats = seats.slice(bayIndex * 8 + 6, bayIndex * 8 + 8);
            return (<div key={bayIndex} className="flex flex-col gap-3">
                        <div className="text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                            Bay {bayIndex + 1}
                          </span>
                        </div>

                        {/* Main 6 Seats (3 rows of 2) */}
                        <div className="grid grid-cols-2 gap-1.5 p-2 rounded-md bg-fog/30 border border-line">
                          {mainSeats.map(seat => {
                    const isSelected = currentSelectedSeatNumbers.includes(seat.number);
                    return (<button key={seat.number} onClick={() => toggleSeat(seat.number, seat.type)} disabled={seat.status !== 'available'} title={`${seat.number} (${seat.type}) - ${seat.status}`} className={cn("w-9 h-9 rounded text-xs font-bold flex flex-col items-center justify-center transition-all border cursor-pointer", seat.status === 'available' && !isSelected && "bg-white border-line-strong text-ink hover:border-royal hover:text-royal hover:bg-royal/5", isSelected && "bg-royal border-royal text-paper shadow-sm scale-105 ring-2 ring-royal/20", seat.status === 'occupied' && "bg-fog-strong border-line text-ink-muted cursor-not-allowed", seat.status === 'reserved' && "bg-sky-light/60 border-sky/30 text-sky-dark cursor-not-allowed")}>
                                <span className="num font-bold leading-none">{seat.number}</span>
                                <span className={cn("text-[8px] font-normal leading-none mt-0.5", isSelected ? "text-paper/80" : "text-ink-muted")}>
                                  {seat.shortType}
                                </span>
                              </button>);
                })}
                        </div>

                        {/* Aisle Spacer */}
                        <div className="h-4 flex items-center justify-center">
                          <div className="w-full h-px bg-line-strong/40"/>
                        </div>

                        {/* Side Berths (2 seats) */}
                        <div className="flex flex-col gap-1.5 p-2 rounded-md bg-amber-50/50 border border-amber-100">
                          {sideSeats.map(seat => {
                    const isSelected = currentSelectedSeatNumbers.includes(seat.number);
                    return (<button key={seat.number} onClick={() => toggleSeat(seat.number, seat.type)} disabled={seat.status !== 'available'} title={`${seat.number} (${seat.type}) - ${seat.status}`} className={cn("w-full h-8 rounded text-xs font-bold flex items-center justify-between px-2 transition-all border cursor-pointer", seat.status === 'available' && !isSelected && "bg-white border-line-strong text-ink hover:border-royal hover:text-royal hover:bg-royal/5", isSelected && "bg-royal border-royal text-paper shadow-sm scale-102 ring-2 ring-royal/20", seat.status === 'occupied' && "bg-fog-strong border-line text-ink-muted cursor-not-allowed", seat.status === 'reserved' && "bg-sky-light/60 border-sky/30 text-sky-dark cursor-not-allowed")}>
                                <span className="num font-bold">{seat.number}</span>
                                <span className={cn("text-[9px] font-normal", isSelected ? "text-paper/80" : "text-ink-muted")}>
                                  {seat.shortType}
                                </span>
                              </button>);
                })}
                        </div>
                      </div>);
        })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Summary Sidebar */}
          <aside className="space-y-4 sticky top-28">
            <Card className="p-6 space-y-5 border-line-mid shadow-raised">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Selection Summary
                </span>
                <h3 className="text-h4 font-bold text-ink mt-0.5">
                  Chosen Berths
                </h3>
              </div>

              <div className="space-y-3 min-h-[140px]">
                {currentSelectedSeatNumbers.length === 0 ? (<div className="rounded-card border border-dashed border-line-strong p-6 text-center text-caption text-ink-soft">
                    Click seats on the coach bay above to reserve for your travellers.
                  </div>) : (currentSelectedSeatNumbers.map((seatNum, idx) => {
            const seatInfo = seats.find(s => s.number === seatNum);
            const passengerName = passengers[idx]?.name || `Passenger ${idx + 1}`;
            return (<div key={seatNum} className="flex items-center justify-between p-3.5 rounded-control bg-fog/30 border border-line">
                        <div>
                          <div className="text-xs font-semibold text-ink line-clamp-1">{passengerName}</div>
                          <div className="num text-caption font-bold text-royal mt-0.5">
                            Coach {activeCoach} · Berth {seatNum}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-line-strong font-medium bg-white">
                          {seatInfo?.type}
                        </Badge>
                      </div>);
        }))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-line pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Selected Berths</span>
                  <span className="num font-semibold text-ink">
                    {currentSelectedSeatNumbers.length} of {maxSeats}
                  </span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Base Rate per Berth</span>
                  <span className="num font-semibold text-ink">₹850</span>
                </div>

                <div className="border-t border-line-mid pt-3 flex justify-between items-baseline">
                  <span className="text-body font-bold text-ink">Total Base</span>
                  <span className="num text-h3 font-bold text-royal">
                    ₹{850 * Math.max(currentSelectedSeatNumbers.length, 1)}
                  </span>
                </div>
              </div>

              <Button onClick={handleContinue} size="lg" className="w-full">
                Proceed to Review
                <ArrowRight className="size-4"/>
              </Button>
            </Card>

            {/* Demo Notice */}
            <div className="rounded-card border border-azure/20 bg-blue-100 p-4 text-caption text-body flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-royal shrink-0 mt-0.5"/>
              <p>
                <b className="font-semibold text-royal">Auto-Assigned if skipped:</b> If you don't choose a specific berth, the reservation engine will allocate optimal contiguous seats.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>);
}
