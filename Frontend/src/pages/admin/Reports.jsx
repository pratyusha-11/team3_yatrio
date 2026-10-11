import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { adminService } from '@/services/adminService';
import { ShieldAlert } from 'lucide-react';
import { fare } from '@/lib/format';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('booking-summary');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const availableReports = [
        { id: 'booking-summary', label: 'Booking Summary' },
        { id: 'revenue', label: 'Revenue Estimates' },
        { id: 'train-occupancy', label: 'Train Occupancy' },
        { id: 'user-activity', label: 'User Activity' }
    ];

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const response = await adminService.getReports({ type: activeTab });
                setData(response.data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load report.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [activeTab]);

    const handleExportCsv = () => {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yatrio-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-bold tracking-tight text-ink">Reports</h1>
                    <p className="text-body text-ink-soft">Detailed administrative reports and data exports.</p>
                </div>
                <Button 
                    variant="outline" 
                    icon={<Download className="size-4" />} 
                    onClick={handleExportCsv}
                    disabled={loading || !data || data.length === 0}
                >
                    Export CSV
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
                    {availableReports.map(report => (
                        <TabsTrigger key={report.id} value={report.id}>
                            {report.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {availableReports.map(report => (
                    <TabsContent key={report.id} value={report.id}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{report.label} Report</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                                    </div>
                                ) : error ? (
                                    <Alert variant="error" icon={<ShieldAlert aria-hidden="true" />}>
                                        {error}
                                    </Alert>
                                ) : !data || data.length === 0 ? (
                                    <div className="py-12 text-center text-ink-soft">
                                        No data available for this report.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table className="w-full text-left">
                                            <TableHeader className="bg-surface-sunken">
                                                <TableRow>
                                                    {Object.keys(data[0]).map(key => (
                                                        <TableHead key={key} className="capitalize px-4">{key.replace(/_/g, ' ')}</TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-line">
                                                {data.map((row, i) => (
                                                    <TableRow key={i} className="hover:bg-surface-sunken/70">
                                                        {Object.values(row).map((val, j) => (
                                                            <TableCell key={j} className={`px-4 ${typeof val === 'number' ? 'num' : ''}`}>
                                                                {keyMatch(Object.keys(row)[j], 'revenue') ? fare(val * 100) : val}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

// Helper to format revenue columns safely
function keyMatch(key, keyword) {
    return key.toLowerCase().includes(keyword.toLowerCase());
}
