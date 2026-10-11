import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 800);
    };
    return (<div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-form rounded-card border border-line-mid bg-white p-8 shadow-card">
        <div className="text-center mb-6">
          <Logo size="md" className="mx-auto mb-4"/>
          <h1 className="text-h3 font-bold tracking-tight text-ink">Reset Password</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Enter your email to receive password recovery instructions.
          </p>
        </div>

        {isSubmitted ? (<div className="space-y-4">
            <Alert variant="success" title="Instructions sent">
              If an account exists for {email}, a password reset link has been dispatched.
            </Alert>
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm font-semibold text-royal hover:underline">
                Return to sign in
              </Link>
            </div>
          </div>) : (<form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" placeholder="passenger@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>

            <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>

            <div className="text-center pt-4">
              <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
                Cancel and return to sign in
              </Link>
            </div>
          </form>)}
      </div>
    </div>);
}
