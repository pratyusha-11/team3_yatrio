import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminService } from '@/services/adminService';
import { IndianRupee } from 'lucide-react';

export default function PaymentsManagement() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const response = await adminService.getPayments({});
                setMessage(response.message || 'Payment data unavailable.');
            } catch {
                setMessage('Failed to load payments.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">Payments</h1>
                <p className="text-body text-ink-soft">Transaction history and gateway verification.</p>
            </div>

            <Card className="p-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-control" />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 rounded-full bg-blue-100 p-4">
                            <IndianRupee className="size-8 text-royal" />
                        </div>
                        <h2 className="text-h4 font-semibold text-ink">Integration Pending</h2>
                        <p className="mt-2 max-w-md text-body text-ink-soft">
                            {message}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
