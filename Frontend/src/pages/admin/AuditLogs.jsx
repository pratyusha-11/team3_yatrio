import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import { time24, dateLong } from '@/lib/format';
import { ShieldAlert, Search } from 'lucide-react';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);
    const [action, setAction] = useState('');
    const [actionTerm, setActionTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await adminService.getAuditLogs({
                    page,
                    pageSize,
                    action: actionTerm || undefined
                });
                setLogs(response.data);
                setTotal(response.total);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load audit logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [page, pageSize, actionTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setActionTerm(action);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">Audit Logs</h1>
                <p className="text-body text-ink-soft">System-wide operational tracking and security events.</p>
            </div>

            <Card className="p-5">
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft size-4" />
                        <Input
                            placeholder="Filter by action (e.g. LOGIN)..."
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <button type="submit" className="h-11 px-5 rounded-control bg-navy text-white text-sm font-semibold transition-colors hover:bg-navy-700">
                        Filter
                    </button>
                </form>

                {error ? (
                    <Alert variant="error" icon={<ShieldAlert aria-hidden="true" />}>
                        {error}
                    </Alert>
                ) : loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full rounded-control" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-12 text-center text-ink-soft">
                        No audit logs found.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="grid gap-4 md:hidden">
                            {logs.map(log => (
                                <div key={log.id} className="rounded-card border border-line-mid bg-white p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-ink">{log.action}</div>
                                            <div className="text-sm text-ink-soft">{log.entity}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-ink num">{log.actor_id || 'SYSTEM'}</div>
                                            <div className="text-caption font-mono text-ink-soft mt-1">{log.entity_id}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm border-t border-line-light pt-3 text-ink-soft num">
                                        {dateLong(log.timestamp)} <span className="mx-1">·</span> {time24(log.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-hidden rounded-card border border-line-mid bg-white">
                            <Table className="w-full text-left">
                                <TableHeader className="bg-surface-sunken">
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Actor ID</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entity</TableHead>
                                        <TableHead>Identifier</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-line">
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="transition-colors hover:bg-surface-sunken/70">
                                            <TableCell className="num text-ink-soft whitespace-nowrap">
                                                {dateLong(log.timestamp)} <span className="mx-1">·</span> {time24(log.timestamp)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-ink num">{log.actor_id || 'SYSTEM'}</TableCell>
                                            <TableCell className="font-medium text-ink">{log.action}</TableCell>
                                            <TableCell>{log.entity}</TableCell>
                                            <TableCell className="font-mono text-sm">{log.entity_id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Pagination 
                                currentPage={page} 
                                totalPages={Math.ceil(total / pageSize)} 
                                onPageChange={setPage} 
                            />
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
