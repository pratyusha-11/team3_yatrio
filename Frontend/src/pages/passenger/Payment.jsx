import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, CreditCard, Smartphone, Building, ArrowLeft, Loader2, Lock, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';
export function Payment() {
    const navigate = useNavigate();
    const { selectedTrain, passengers } = useBooking();
    const [activeTab, setActiveTab] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const travellerCount = Math.max(passengers.length, 1);
    const totalAmount = Math.round(travellerCount * 850 * 1.05 + travellerCount * 70);
    useEffect(() => {
        if (timeLeft <= 0)
            return;
        const timerId = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate payment authorization
        setTimeout(() => {
            navigate('/booking/success');
        }, 1600);
    };
    return (<div className="min-h-screen bg-fog/20 pb-20">
      {/* Yatrio Multi-Step Breadcrumb */}
      <div className="border-b border-line bg-white sticky top-16 z-20 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3.5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                <Check className="size-4 stroke-[2.5]"/>
              </span>
              <span className="text-caption font-semibold text-ink hidden sm:inline">Passengers</span>
            </div>
            <div className="h-0.5 w-12 bg-emerald-500 rounded-full"/>

            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                <Check className="size-4 stroke-[2.5]"/>
              </span>
              <span className="text-caption font-semibold text-ink hidden sm:inline">Seats</span>
            </div>
            <div className="h-0.5 w-12 bg-emerald-500 rounded-full"/>

            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                <Check className="size-4 stroke-[2.5]"/>
              </span>
              <span className="text-caption font-semibold text-ink hidden sm:inline">Review</span>
            </div>
            <div className="h-0.5 w-12 bg-emerald-500 rounded-full"/>

            <div className="flex items-center gap-2">
              <span className="num size-7 rounded-full bg-royal text-paper text-xs font-bold flex items-center justify-center ring-4 ring-royal/15">
                4
              </span>
              <span className="text-caption font-bold text-royal">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/booking/review')} className="mb-6 -ml-2 text-ink-soft hover:text-ink gap-1.5">
          <ArrowLeft className="size-4"/> Back to Review
        </Button>

        {/* Security / Timer Bar */}
        <div className="mb-6 rounded-card bg-navy text-paper p-4 flex flex-wrap items-center justify-between gap-4 shadow-raised">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-emerald-400 shrink-0"/>
            <div>
              <span className="text-sm font-bold block">100% Encrypted Payment Gateway</span>
              <span className="text-caption text-paper/75">RBI & PCI-DSS Compliant 256-bit SSL</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-control">
            <span className="text-caption text-paper/80 font-medium">Session Expires in:</span>
            <span className="num text-sm font-bold font-mono text-amber-300">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Payment Method Selector */}
          <Card className="p-0 overflow-hidden border-line-mid shadow-card rounded-card">
            {/* Tab Headers */}
            <div className="flex border-b border-line bg-fog/30">
              <button type="button" onClick={() => setActiveTab('upi')} className={cn("flex-1 py-4 px-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all cursor-pointer border-b-2", activeTab === 'upi'
            ? "border-royal text-royal bg-white"
            : "border-transparent text-ink-soft hover:text-ink hover:bg-white/60")}>
                <Smartphone className="size-4"/> UPI Instant
              </button>
              <button type="button" onClick={() => setActiveTab('card')} className={cn("flex-1 py-4 px-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all cursor-pointer border-b-2", activeTab === 'card'
            ? "border-royal text-royal bg-white"
            : "border-transparent text-ink-soft hover:text-ink hover:bg-white/60")}>
                <CreditCard className="size-4"/> Credit / Debit Card
              </button>
              <button type="button" onClick={() => setActiveTab('netbanking')} className={cn("flex-1 py-4 px-3 flex items-center justify-center gap-2 font-semibold text-sm transition-all cursor-pointer border-b-2", activeTab === 'netbanking'
            ? "border-royal text-royal bg-white"
            : "border-transparent text-ink-soft hover:text-ink hover:bg-white/60")}>
                <Building className="size-4"/> Net Banking
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 md:p-8 bg-white min-h-[380px]">
              {activeTab === 'upi' && (<form onSubmit={handlePayment} className="space-y-6 max-w-sm mx-auto">
                  <div className="text-center space-y-3">
                    <div className="size-44 mx-auto rounded-card border-2 border-dashed border-royal/30 p-3 bg-white flex flex-col items-center justify-center shadow-subtle">
                      <QrCode className="size-28 text-navy"/>
                      <span className="text-[10px] font-bold text-royal uppercase tracking-wider mt-1">
                        Scan with GPay / PhonePe / Paytm
                      </span>
                    </div>
                    <div className="text-caption text-ink-soft">
                      Scan the dynamic QR code or type your Virtual Payment Address below.
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center my-4">
                    <div className="w-full h-px bg-line"/>
                    <span className="absolute bg-white px-3 text-eyebrow font-semibold uppercase tracking-wider text-ink-muted">
                      OR UPI ID
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Enter UPI ID / VPA *
                    </label>
                    <Input placeholder="e.g. yourname@okhdfcbank" required disabled={isProcessing}/>
                  </div>

                  <Button type="submit" disabled={isProcessing} size="lg" className="w-full text-base font-bold shadow-raised">
                    {isProcessing ? (<>
                        <Loader2 className="size-4 animate-spin"/> Authorizing Payment...
                      </>) : (<>Pay ₹{totalAmount} Instantly</>)}
                  </Button>
                </form>)}

              {activeTab === 'card' && (<form onSubmit={handlePayment} className="space-y-5 max-w-md mx-auto">
                  <div className="space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Card Number *
                    </label>
                    <div className="relative">
                      <Input placeholder="4532 •••• •••• 8921" maxLength={19} required disabled={isProcessing} className="num pl-10"/>
                      <CreditCard className="size-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                        Expiry Date *
                      </label>
                      <Input placeholder="MM / YY" maxLength={5} required disabled={isProcessing} className="num"/>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                        CVV / CVC *
                      </label>
                      <Input type="password" placeholder="•••" maxLength={4} required disabled={isProcessing} className="num"/>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Cardholder Name *
                    </label>
                    <Input placeholder="e.g. Rahul Sharma" required disabled={isProcessing}/>
                  </div>

                  <Button type="submit" disabled={isProcessing} size="lg" className="w-full text-base font-bold shadow-raised mt-2">
                    {isProcessing ? (<>
                        <Loader2 className="size-4 animate-spin"/> Verifying OTP...
                      </>) : (<>Pay ₹{totalAmount}</>)}
                  </Button>
                </form>)}

              {activeTab === 'netbanking' && (<form onSubmit={handlePayment} className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-3">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Popular Banks
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak', 'PNB'].map(bank => (<button key={bank} type="button" onClick={() => { }} className="p-3 rounded-card border border-line hover:border-royal hover:bg-royal/5 transition-all text-center cursor-pointer">
                          <span className="text-xs font-bold text-ink block">{bank}</span>
                        </button>))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                      Or Select from All Indian Banks
                    </label>
                    <select className="h-11 w-full rounded-control border border-line-strong bg-white px-3.5 text-sm font-medium text-ink focus:border-royal focus:ring-4 focus:ring-royal/15 cursor-pointer">
                      <option>Bank of Baroda</option>
                      <option>Canara Bank</option>
                      <option>Union Bank of India</option>
                      <option>Indian Overseas Bank</option>
                      <option>Yes Bank</option>
                      <option>IndusInd Bank</option>
                    </select>
                  </div>

                  <Button type="submit" disabled={isProcessing} size="lg" className="w-full text-base font-bold shadow-raised">
                    {isProcessing ? (<>
                        <Loader2 className="size-4 animate-spin"/> Connecting to Bank...
                      </>) : (<>Authenticate & Pay ₹{totalAmount}</>)}
                  </Button>
                </form>)}
            </div>

            {/* Encrypted Footer */}
            <div className="bg-fog/30 p-3.5 border-t border-line flex items-center justify-center gap-6 text-caption text-ink-soft">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="size-3.5 text-royal"/> 256-bit SSL Security
              </span>
              <span>•</span>
              <span className="font-medium">No card details stored</span>
            </div>
          </Card>

          {/* Right Summary Sidebar */}
          <aside className="space-y-4">
            <Card className="p-6 space-y-5 border-line-mid shadow-raised rounded-card">
              <div>
                <span className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  Amount Due
                </span>
                <div className="num text-display font-black text-royal mt-0.5">
                  ₹{totalAmount}
                </div>
                <span className="text-caption text-ink-soft">Total Inclusive of all taxes</span>
              </div>

              <div className="border-t border-line pt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    {selectedTrain?.number || '12951'} {selectedTrain?.name || 'Mumbai Rajdhani Exp'}
                  </span>
                  <span className="text-caption text-ink-soft">
                    15 Oct 2026 · {travellerCount} Traveller{travellerCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-ink block">Class / Quota</span>
                  <span className="text-caption text-ink-soft">AC 3 Tier (3A) · General</span>
                </div>
              </div>
            </Card>

            {/* Mandatory Demo-Mode Notice (§7.7) */}
            <div className="rounded-card border border-azure/25 bg-blue-100 p-4 text-caption text-body flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-royal shrink-0 mt-0.5"/>
              <p>
                <b className="font-semibold text-royal">Demo Mode:</b> Simulated checkout. No actual money will be charged to any card or account.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>);
}
