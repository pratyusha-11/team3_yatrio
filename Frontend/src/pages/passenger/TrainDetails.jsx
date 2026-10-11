import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Calendar, Coffee, Wifi, Plug, ShieldCheck, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RouteConnector } from '@/components/ui/RouteConnector';
import { cn } from '@/lib/utils';
import { trains as mockTrains } from '@/data/trains';
import { useBooking } from '@/context/BookingContext';

export function TrainDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedTrain, setSelectedClass } = useBooking();

  const [activeTab, setActiveTab] = useState('schedule');

  const train = mockTrains?.find((t) => t.id === id || t.number === id) || {
    id: id || '1',
    number: '12951',
    name: 'Mumbai Rajdhani',
    type: 'Rajdhani',
    source: { name: 'New Delhi', code: 'NDLS' },
    destination: { name: 'Mumbai Central', code: 'MMCT' },
    duration: '15h 40m',
  };

  const stops = [
    { name: 'New Delhi', code: 'NDLS', arr: 'Source', dep: '16:55', day: 1, platform: '1', dist: 0 },
    { name: 'Kota Junction', code: 'KOTA', arr: '21:30', dep: '21:40', day: 1, platform: '2', dist: 465 },
    { name: 'Vadodara Junction', code: 'BRC', arr: '03:10', dep: '03:20', day: 2, platform: '1', dist: 992 },
    { name: 'Surat', code: 'ST', arr: '04:50', dep: '04:55', day: 2, platform: '2', dist: 1122 },
    { name: 'Mumbai Central', code: 'MMCT', arr: '08:35', dep: 'Destination', day: 2, platform: '1', dist: 1384 },
  ];

  const classes = [
    { type: '1A', name: 'First AC', fare: 2850, status: 'AVAILABLE', seats: 12 },
    { type: '2A', name: 'Second AC', fare: 1850, status: 'AVAILABLE', seats: 28 },
    { type: '3A', name: 'Third AC', fare: 1250, status: 'AVAILABLE', seats: 64 },
    { type: 'SL', name: 'Sleeper', fare: 480, status: 'WL 14', seats: 0 },
  ];

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleBook = (clsType) => {
    setSelectedTrain(train);
    setSelectedClass(clsType);
    navigate(`/booking/passenger-details?train=${train.id}&class=${clsType}`);
  };

  return (
    <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/search">
        <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent">
          <ArrowLeft className="size-4 mr-1.5" /> Back to Results
        </Button>
      </Link>

      {/* Train Header Banner */}
      <div className="rounded-card border border-white/10 bg-[linear-gradient(135deg,#04275B_0%,#014CA9_78%,#0A63C6_100%)] p-6 sm:p-8 text-white blueprint shadow-panel">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-h2 font-bold tracking-tight text-white leading-tight">
                {train.number} {train.name}
              </h1>
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-caption font-semibold text-white">
                {train.type}
              </span>
            </div>
            <p className="text-on-dark-soft flex items-center gap-3 text-sm">
              <span>{train.source?.name} ({train.source?.code}) → {train.destination?.name} ({train.destination?.code})</span>
              <span>·</span>
              <span className="num font-semibold text-white">{train.duration || '15h 40m'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="md" showDot pulseDot>
              Live Telemetry Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Availability & Classes Table */}
          <Card className="p-6 space-y-4">
            <h2 className="text-h4 font-semibold text-ink border-b border-line pb-3">
              Fares & Availability by Class
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-sunken border-b border-line-mid text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    <th scope="col" className="p-3">Class</th>
                    <th scope="col" className="p-3">Base Fare</th>
                    <th scope="col" className="p-3">Status</th>
                    <th scope="col" className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {classes.map((cls) => (
                    <tr key={cls.type} className="hover:bg-surface-sunken/60 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-ink">{cls.type}</div>
                        <div className="text-caption text-ink-soft">{cls.name}</div>
                      </td>
                      <td className="p-3 num font-bold text-royal text-sm">
                        ₹{cls.fare}
                      </td>
                      <td className="p-3">
                        <span className={cn(
                          "num text-caption font-semibold px-2 py-0.5 rounded-control",
                          cls.status.includes('AVAILABLE') ? "bg-status-success/12 text-success-strong" : "bg-status-warning/14 text-warning-strong"
                        )}>
                          {cls.status} {cls.seats > 0 ? `(${cls.seats})` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleBook(cls.type)}
                        >
                          Book Now
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Route Schedule Timeline */}
          <Card className="p-6 space-y-6">
            <h2 className="text-h4 font-semibold text-ink border-b border-line pb-3">
              Route & Station Schedule
            </h2>

            <div className="space-y-6 pl-4 border-l-2 border-line ml-3">
              {stops.map((stop, idx) => {
                const isOrigin = idx === 0;
                const isDest = idx === stops.length - 1;

                return (
                  <div key={stop.code} className="relative pl-6">
                    {/* Station Dot */}
                    <div
                      className={cn(
                        "absolute -left-[23px] top-1 size-3 rounded-full border-2 border-white shadow-sm",
                        isOrigin ? "bg-status-success" : isDest ? "bg-azure" : "bg-royal"
                      )}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-4">
                      <div>
                        <div className="text-body font-semibold text-ink">
                          {stop.name} <span className="text-ink-soft">({stop.code})</span>
                        </div>
                        <div className="text-caption text-ink-soft num">
                          Platform {stop.platform} · {stop.dist} km
                        </div>
                      </div>

                      <div className="flex gap-6 text-sm num">
                        <div>
                          <span className="text-caption text-ink-soft block">Arr</span>
                          <span className="font-semibold text-ink">{stop.arr}</span>
                        </div>
                        <div>
                          <span className="text-caption text-ink-soft block">Dep</span>
                          <span className="font-semibold text-ink">{stop.dep}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Running Days */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink flex items-center gap-2">
              <Calendar className="size-4 text-royal" /> Running Days
            </h3>
            <div className="flex justify-between gap-1 pt-1">
              {days.map((d, i) => (
                <div
                  key={i}
                  className="size-8 rounded-full bg-royal text-white flex items-center justify-center text-xs font-semibold num shadow-sm"
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="text-caption text-ink-soft pt-1">Operates 7 days a week.</p>
          </Card>

          {/* On-board Amenities */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">
              Train Amenities
            </h3>
            <div className="space-y-3 text-sm text-body">
              <div className="flex items-center gap-3">
                <Coffee className="size-4 text-royal shrink-0" />
                <span>Pantry car & catering services</span>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="size-4 text-royal shrink-0" />
                <span>High-speed onboard WiFi</span>
              </div>
              <div className="flex items-center gap-3">
                <Plug className="size-4 text-royal shrink-0" />
                <span>Charging sockets per berth</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-royal shrink-0" />
                <span>Onboard security and CCTV</span>
              </div>
            </div>
          </Card>

          {/* Booking Support Notice */}
          <div className="rounded-card border border-azure/25 bg-blue-100 p-4 text-caption text-body">
            <b className="font-semibold text-royal">Instant Booking.</b> Confirmations are verified instantly through Yatrio reservation pipeline.
          </div>
        </div>
      </div>
    </div>
  );
}
