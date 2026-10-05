import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
export function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/search');
        }
        catch (err) {
            setError(err.message || 'Invalid credentials');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left Column: Sign In Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 max-w-form mx-auto w-full">
        <div className="mb-8">
          <Logo size="md" className="mb-6"/>
          <h1 className="text-h2 font-bold tracking-tight text-ink">Sign In</h1>
          <p className="mt-2 text-body text-ink-soft">
            Access your tickets, manage trips, and track live bookings.
          </p>
        </div>

        {error && (<Alert variant="error" title="Authentication failed" className="mb-6">
            {error}
          </Alert>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email address" type="email" placeholder="passenger@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>

          <div className="space-y-1.5">
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-caption font-semibold text-royal hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Sign In
          </Button>

          {/* Quick Demo Access Credentials */}
          <div className="pt-4 border-t border-line mt-6">
            <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft text-center mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => {
            setEmail('rahul.sharma@example.com');
            setPassword('Passenger@123');
        }} className="px-3 py-2 text-caption font-semibold rounded-control border border-line-strong bg-white hover:bg-fog text-ink text-center transition-colors">
                Passenger Demo
              </button>
              <button type="button" onClick={() => {
            setEmail('admin@railconnect.in');
            setPassword('Admin@123');
        }} className="px-3 py-2 text-caption font-semibold rounded-control border border-royal/30 bg-blue-100 hover:bg-sky/20 text-royal text-center transition-colors">
                Admin Demo
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-ink-soft">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-royal hover:underline">
            Register here
          </Link>
        </div>
      </div>

      {/* Right Column: Horizon Blueprint Brand Panel (brandkit §9.11) */}
      <div className="hidden lg:flex flex-col justify-between bg-[linear-gradient(135deg,#04275B_0%,#014CA9_78%,#0A63C6_100%)] p-12 text-white blueprint relative overflow-hidden">
        <div className="relative z-10">
          <Logo size="lg" variant="dark" showTagline/>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-display font-bold tracking-tight text-white leading-tight">
            Move Beyond Limits.
          </h2>
          <p className="text-lead text-on-dark-soft">
            Experience next-generation railway reservations with zero latency and live station updates.
          </p>

          <div className="rounded-card border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow uppercase tracking-[0.16em] text-sky-bright font-semibold">
                Network Reliability
              </span>
              <span className="num font-bold text-white">99.98%</span>
            </div>
            <p className="text-caption text-on-dark-soft">
              Real-time synchronization across 1,840 stations and 12,000+ daily trains nationwide.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-caption text-on-dark-label">
          © 2026 Yatrio Platform · Precision Rail Systems
        </div>
      </div>
    </div>);
}
