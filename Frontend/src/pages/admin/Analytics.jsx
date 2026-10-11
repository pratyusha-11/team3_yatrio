import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import { ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const BRAND_COLORS = ['#014CA9', '#0080F8', '#28C840', '#FEBC2E', '#E02020'];

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await adminService.getAnalytics({});
                setData(response.data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load analytics.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-h2 font-bold text-ink">Analytics</h1>
                    <p className="text-body text-ink-soft">Deeper insights and long-term trend analysis.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 rounded-card" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="error" icon={<ShieldAlert aria-hidden="true" />}>
                {error}
            </Alert>
        );
    }

    if (!data) return null;

    // Formatting for User Activity Pie Chart
    const userRoleData = data.userActivity?.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.role.toUpperCase());
        if (existing) {
            existing.value += curr.user_count;
        } else {
            acc.push({ name: curr.role.toUpperCase(), value: curr.user_count });
        }
        return acc;
    }, []) || [];

    const userStatusData = data.userActivity?.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.status.toUpperCase());
        if (existing) {
            existing.value += curr.user_count;
        } else {
            acc.push({ name: curr.status.toUpperCase(), value: curr.user_count });
        }
        return acc;
    }, []) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">Analytics</h1>
                <p className="text-body text-ink-soft">Deeper insights and long-term trend analysis.</p>
            </div>

            <div className="flex gap-3 rounded-card border border-azure/25 bg-blue-100 p-4">
                <span className="mt-0.5 size-5 shrink-0 text-royal text-lg font-bold" aria-hidden="true">i</span>
                <p className="text-caption text-body">
                    <b className="font-semibold text-royal">Integration Pending.</b> {data.notes}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Roles Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                        {userRoleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                        {userStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={BRAND_COLORS[(index + 2) % BRAND_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
