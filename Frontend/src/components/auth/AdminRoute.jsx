import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-paper">Loading...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace/>;
    }
    
    if (!isAdmin) {
        // Show an explicit 403 Forbidden page for authenticated non-admin users
        return (
            <div className="flex h-screen items-center justify-center bg-paper p-4">
                <Card className="max-w-md p-8 text-center shadow-pop border-line-mid">
                    <ShieldAlert className="size-12 mx-auto text-error-strong mb-4" aria-hidden="true" />
                    <h1 className="text-h3 font-semibold text-ink">Access Denied</h1>
                    <p className="mt-2 text-body text-ink-soft">
                        You do not have administrator privileges to view this section.
                    </p>
                    <div className="mt-6">
                        <Button variant="primary" onClick={() => window.location.href = '/'}>
                            Return to Passenger Site
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    return <Outlet />;
}
