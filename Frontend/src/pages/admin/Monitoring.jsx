import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { adminService } from '@/services/adminService';
import { time24, dateLong } from '@/lib/format';
import { ShieldAlert, Database, Server, Activity } from 'lucide-react';

export default function Monitoring() {
    const [system, setSystem] = useState(null);
    const [sysLoading, setSysLoading] = useState(true);
    const [sysError, setSysError] = useState(null);

    const [apiLogs, setApiLogs] = useState([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [totalLogs, setTotalLogs] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    useEffect(() => {
        const fetchSystem = async () => {
            try {
                setSysLoading(true);
                const response = await adminService.getMonitoringSystem();
                setSystem(response);
            } catch (err) {
                setSysError(err.message || 'Failed to check system health.');
            } finally {
                setSysLoading(false);
            }
        };

        fetchSystem();
    }, []);

    useEffect(() => {
        const fetchApiLogs = async () => {
            try {
                setApiLoading(true);
                const response = await adminService.getMonitoringApi({ page, pageSize });
                setApiLogs(response.data);
                setTotalLogs(response.total);
            } catch (err) {
                console.error(err);
            } finally {
                setApiLoading(false);
            }
        };

        fetchApiLogs();
    }, [page, pageSize]);

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'OK':
                return <Badge variant="success">Healthy</Badge>;
            case 'DEGRADED':
                return <Badge variant="warning">Degraded</Badge>;
            case 'DOWN':
                return <Badge variant="error">Error</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">System Monitoring</h1>
                <p className="text-body text-ink-soft">Real-time health, latency, and operational telemetry.</p>
            </div>

            {sysError && (
                <Alert variant="error" icon={<ShieldAlert aria-hidden="true" />}>
                    {sysError}
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-royal">
                                <Database className="size-5" />
                            </div>
                            <div>
                                <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">MySQL Database</p>
                            </div>
                        </div>
                        {sysLoading ? <Skeleton className="h-6 w-16" /> : renderStatusBadge(system?.services?.database?.status)}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-royal">
                                <Server className="size-5" />
                            </div>
                            <div>
                                <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">Redis Cache</p>
                            </div>
                        </div>
                        {sysLoading ? <Skeleton className="h-6 w-16" /> : renderStatusBadge(system?.services?.redis?.status)}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2 text-royal">
                                <Activity className="size-5" />
                            </div>
                            <div>
                                <p className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-soft">REST API</p>
                            </div>
                        </div>
                        {sysLoading ? <Skeleton className="h-6 w-16" /> : renderStatusBadge(system?.services?.api?.status)}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>API Request Logs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {apiLoading ? (
                        <div className="p-5 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : apiLogs.length === 0 ? (
                        <div className="p-12 text-center text-ink-soft">No API request logs available.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table className="w-full text-left">
                                    <TableHeader className="bg-surface-sunken">
                                        <TableRow>
                                            <TableHead className="px-5">Timestamp</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Endpoint</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right px-5">Latency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-line">
                                        {apiLogs.map((log) => (
                                            <TableRow key={log.id} className="transition-colors hover:bg-surface-sunken/70">
                                                <TableCell className="px-5 num text-ink-soft whitespace-nowrap">
                                                    {time24(log.timestamp)}
                                                </TableCell>
                                                <TableCell className="font-semibold text-ink">{log.method}</TableCell>
                                                <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.status_code >= 400 ? 'error' : 'success'}>
                                                        {log.status_code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-5 num">{log.latency_ms} ms</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="p-5 border-t border-line-mid flex justify-end">
                                <Pagination 
                                    currentPage={page} 
                                    totalPages={Math.ceil(totalLogs / pageSize) || 1} 
                                    onPageChange={setPage} 
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
