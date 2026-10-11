import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import { ShieldAlert, Search } from 'lucide-react';

export default function TrainManagement() {
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTrains = async () => {
            try {
                setLoading(true);
                const response = await adminService.getTrains({
                    page,
                    pageSize,
                    search: searchTerm
                });
                setTrains(response.data);
                setTotal(response.total);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load trains.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrains();
    }, [page, pageSize, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerm(search);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">Trains</h1>
                <p className="text-body text-ink-soft">Read-only operational view of Yatrio train fleet.</p>
            </div>

            <Card className="p-5">
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft size-4" />
                        <Input
                            placeholder="Search train number or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-control" />)}
                    </div>
                ) : trains.length === 0 ? (
                    <div className="py-12 text-center text-ink-soft">
                        No trains match these filters.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="grid gap-4 md:hidden">
                            {trains.map(train => (
                                <div key={train.id} className="rounded-card border border-line-mid bg-white p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-ink num">{train.train_number}</div>
                                            <div className="font-medium text-ink">{train.train_name}</div>
                                        </div>
                                        <Badge variant={train.status === 'active' ? 'success' : train.status === 'delayed' ? 'error' : 'warning'}>
                                            {train.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-line-light pt-3">
                                        <span className="text-ink-soft">{train.train_type}</span>
                                        <span className="text-ink-soft text-caption">Pantry: {train.pantry_available ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-hidden rounded-card border border-line-mid bg-white">
                            <Table className="w-full text-left">
                                <TableHeader className="bg-surface-sunken">
                                    <TableRow>
                                        <TableHead>Number</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Pantry</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-line">
                                    {trains.map((train) => (
                                        <TableRow key={train.id} className="transition-colors hover:bg-surface-sunken/70">
                                            <TableCell className="font-semibold text-ink num">{train.train_number}</TableCell>
                                            <TableCell className="font-medium text-ink">{train.train_name}</TableCell>
                                            <TableCell>{train.train_type}</TableCell>
                                            <TableCell>
                                                {train.pantry_available ? (
                                                    <span className="text-royal">Yes</span>
                                                ) : (
                                                    <span className="text-ink-soft">No</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={train.status === 'active' ? 'success' : train.status === 'delayed' ? 'error' : 'warning'}>
                                                    {train.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
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
