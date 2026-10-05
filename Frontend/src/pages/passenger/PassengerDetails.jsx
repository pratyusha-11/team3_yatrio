import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { useBooking } from '@/context/BookingContext';
export function PassengerDetails() {
    const navigate = useNavigate();
    const { selectedTrain, selectedClass, passengers, addPassenger, removePassenger, updatePassenger, calculateFare } = useBooking();
    const [localPassengers, setLocalPassengers] = useState(passengers && passengers.length > 0
        ? passengers
        : [{ id: '1', name: 'Rahul Sharma', age: '32', gender: 'Male', berthPreference: 'Lower' }]);
    const [contact, setContact] = useState({
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
    });
    const handleAdd = () => {
        if (localPassengers.length < 6) {
            const newP = {
                id: Date.now().toString(),
                name: '',
                age: '',
                gender: 'Male',
                berthPreference: 'No Preference',
            };
            setLocalPassengers([...localPassengers, newP]);
        }
    };
    const handleRemove = (id) => {
        if (localPassengers.length > 1) {
            setLocalPassengers(localPassengers.filter((p) => p.id !== id));
        }
    };
    const handleChange = (id, field, value) => {
        setLocalPassengers(localPassengers.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        localPassengers.forEach((p) => {
            const existing = passengers.find((ep) => ep.id === p.id);
            if (!existing)
                addPassenger(p);
            else
                updatePassenger(p.id, p);
        });
        calculateFare();
        navigate('/booking/seat-selection');
    };
    const trainName = selectedTrain?.name || 'Mumbai Rajdhani';
    const trainNo = selectedTrain?.number || '12951';
    const travelClass = selectedClass || '3A';
    const baseRate = travelClass === '1A' ? 2850 : travelClass === '2A' ? 1850 : travelClass === '3A' ? 1250 : 480;
    const estimatedTotal = localPassengers.length * baseRate;
    return (<div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 4-Step Stepper Header */}
      <div className="rounded-card border border-line-mid bg-white p-4 shadow-card">
        <div className="grid grid-cols-4 text-center">
          <div className="flex flex-col items-center gap-1.5 border-b-2 border-azure pb-2">
            <span className="num size-7 rounded-full bg-azure text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-caption font-semibold text-ink">Passengers</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-b-2 border-transparent pb-2 text-ink-soft">
            <span className="num size-7 rounded-full bg-fog text-ink-soft text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-caption font-medium">Seats</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-b-2 border-transparent pb-2 text-ink-soft">
            <span className="num size-7 rounded-full bg-fog text-ink-soft text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-caption font-medium">Review</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-b-2 border-transparent pb-2 text-ink-soft">
            <span className="num size-7 rounded-full bg-fog text-ink-soft text-xs font-bold flex items-center justify-center">4</span>
            <span className="text-caption font-medium">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
        {/* Left Form Column */}
        <form id="passenger-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Step 1 of 4
            </span>
            <h1 className="text-h2 font-bold tracking-tight text-ink mt-0.5">
              Passenger Information
            </h1>
            <p className="text-body text-ink-soft mt-1">
              Enter traveller details matching government-issued ID proofs.
            </p>
          </div>

          {/* Passenger Cards */}
          <div className="space-y-4">
            {localPassengers.map((passenger, index) => (<Card key={passenger.id} className="p-5 space-y-4 relative border-line-mid">
                <div className="flex justify-between items-center border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="num size-6 rounded-full bg-royal/10 text-royal font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">
                      Passenger {index + 1}
                    </h3>
                  </div>

                  {localPassengers.length > 1 && (<button type="button" onClick={() => handleRemove(passenger.id)} className="text-caption font-semibold text-error-strong hover:underline flex items-center gap-1 cursor-pointer">
                      <Trash2 className="size-3.5"/> Remove
                    </button>)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6 space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Full Name *
                    </label>
                    <input type="text" placeholder="e.g. Rahul Sharma" value={passenger.name} onChange={(e) => handleChange(passenger.id, 'name', e.target.value)} required className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15"/>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Age *
                    </label>
                    <input type="number" min="1" max="110" placeholder="32" value={passenger.age} onChange={(e) => handleChange(passenger.id, 'age', e.target.value)} required className="num h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15"/>
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Gender *
                    </label>
                    <select value={passenger.gender} onChange={(e) => handleChange(passenger.id, 'gender', e.target.value)} className="h-11 w-full rounded-control border border-line-strong bg-white px-3 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15 cursor-pointer">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Berth Preference
                  </label>
                  <select value={passenger.berthPreference} onChange={(e) => handleChange(passenger.id, 'berthPreference', e.target.value)} className="h-11 w-full rounded-control border border-line-strong bg-white px-3 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15 cursor-pointer sm:w-1/2">
                    <option value="No Preference">No Preference</option>
                    <option value="Lower">Lower Berth</option>
                    <option value="Middle">Middle Berth</option>
                    <option value="Upper">Upper Berth</option>
                    <option value="Side Lower">Side Lower</option>
                    <option value="Side Upper">Side Upper</option>
                  </select>
                </div>
              </Card>))}

            {localPassengers.length < 6 && (<button type="button" onClick={handleAdd} className="w-full h-12 rounded-control border border-dashed border-royal/40 text-royal font-semibold text-sm hover:bg-royal/5 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <UserPlus className="size-4"/> Add Traveller ({localPassengers.length}/6)
              </button>)}
          </div>

          {/* Contact Details Card */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink border-b border-line pb-2">
              Ticket Delivery & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Mobile Number *
                </label>
                <div className="flex">
                  <span className="h-11 px-3.5 bg-surface-sunken border border-r-0 border-line-strong rounded-l-control text-sm font-semibold text-ink flex items-center">
                    +91
                  </span>
                  <input type="tel" pattern="[0-9]{10}" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} required className="num h-11 w-full rounded-r-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15"/>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Email Address *
                </label>
                <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15"/>
              </div>
            </div>
          </Card>
        </form>

        {/* Right Sticky Fare Summary */}
        <aside className="space-y-4 sticky top-20">
          <Card className="p-6 space-y-6 shadow-raised border-line-mid">
            <div>
              <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Journey Summary
              </span>
              <h2 className="text-h4 font-semibold text-ink mt-0.5">
                {trainNo} {trainName}
              </h2>
              <span className="num text-caption font-semibold text-royal">
                Class: {travelClass} · General Quota
              </span>
            </div>

            <RouteConnector fromCode="NDLS" toCode="MMCT" fromName="New Delhi" toName="Mumbai Central" depTime="16:55" arrTime="08:35" duration="15h 40m" size="sm"/>

            {/* Fare Breakdown */}
            <div className="border-t border-line pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Base Fare ({localPassengers.length} traveller{localPassengers.length > 1 ? 's' : ''})</span>
                <span className="num font-semibold text-ink">₹{estimatedTotal}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Reservation & Superfast</span>
                <span className="num font-semibold text-ink">₹{localPassengers.length * 70}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>GST (5%)</span>
                <span className="num font-semibold text-ink">₹{Math.round(estimatedTotal * 0.05)}</span>
              </div>

              <div className="border-t border-line-mid pt-3 flex justify-between items-baseline">
                <span className="text-body font-bold text-ink">Estimated Total</span>
                <span className="num text-h3 font-bold text-royal">
                  ₹{Math.round(estimatedTotal * 1.05 + localPassengers.length * 70)}
                </span>
              </div>
            </div>

            <Button form="passenger-form" type="submit" size="lg" className="w-full">
              Continue to Seat Selection
              <ArrowRight className="size-4"/>
            </Button>
          </Card>

          {/* Test Notice */}
          <div className="rounded-card border border-azure/25 bg-blue-100 p-4 text-caption text-body flex items-start gap-2.5">
            <Info className="size-4 text-royal shrink-0 mt-0.5"/>
            <p>
              <b className="font-semibold text-royal">Valid ID required.</b> Carry original government ID (Aadhaar, Passport, Voter ID) during the journey.
            </p>
          </div>
        </aside>
      </div>
    </div>);
}
