import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';


export default function AdminLogin() {
    const { login, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Auto-redirect if already logged in as admin
    React.useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            
            // The context's login function handles the network fetch AND setting tokens
            await login(email, password);
            
            // Check role immediately from the stored user
            const storedUser = JSON.parse(localStorage.getItem('railconnect_user') || '{}');
            const role = storedUser.role;
            if (role !== 'admin' && role !== 'ADMIN') {
                if (logout) logout();
                setError('You do not have administrator privileges.');
                return;
            }

            const from = location.state?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid credentials or server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left side - Login Form */}
            <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-paper">
                <div className="mx-auto w-full max-w-form">
                    <h1 className="text-h3 font-bold tracking-tight text-ink">Admin Control Centre</h1>
                    <p className="mt-2 text-body text-ink-soft">
                        Sign in with your administrative credentials to manage operations.
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <Alert variant="error" icon={<ShieldAlert aria-hidden="true" />}>
                                {error}
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <Input
                                id="email"
                                type="email"
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                disabled={loading}
                            />
                            <Input
                                id="password"
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            variant="primary"
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? 'Authenticating...' : 'Sign in securely'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right side - Brand visual */}
            <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#04275B_0%,#014CA9_78%,#0A63C6_100%)] px-12 py-16 text-white blueprint">
                <div className="relative z-10">
                    <Logo variant="dark" size="lg" />
                </div>
                
                <div className="relative z-10 mt-auto">
                    <p className="text-display font-bold tracking-[-0.02em] leading-tight">
                        Rail journeys,<br />reimagined in motion.
                    </p>
                    <p className="mt-6 text-lead max-w-md text-white/80">
                        Operational intelligence and system infrastructure controls.
                    </p>
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#081221_0%,#0E3B74_100%)] opacity-40 mix-blend-multiply" />
            </div>
        </div>
    );
}
