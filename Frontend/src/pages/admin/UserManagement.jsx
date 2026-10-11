import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import { dateLong } from '@/lib/format';
import { ShieldAlert, Search } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await adminService.getUsers({
                    page,
                    pageSize,
                    search: searchTerm
                });
                setUsers(response.data);
                setTotal(response.total);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page, pageSize, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchTerm(search);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 font-bold tracking-tight text-ink">Users</h1>
                <p className="text-body text-ink-soft">Manage passenger and administrator accounts.</p>
            </div>

            <Card className="p-5">
                <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft size-4" />
                        <Input
                            placeholder="Search name, email, or phone..."
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
                ) : users.length === 0 ? (
                    <div className="py-12 text-center text-ink-soft">
                        No users match these filters.
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="grid gap-4 md:hidden">
                            {users.map(user => (
                                <div key={user.id} className="rounded-card border border-line-mid bg-white p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-ink">{user.full_name}</div>
                                            <div className="text-sm text-ink-soft">{user.email}</div>
                                        </div>
                                        <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                                            {user.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-line-light pt-3">
                                        <Badge variant={user.role === 'admin' || user.role === 'ADMIN' ? 'royal' : 'outline'}>
                                            {user.role.toUpperCase()}
                                        </Badge>
                                        <span className="text-ink-soft num text-caption">Joined {dateLong(user.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-hidden rounded-card border border-line-mid bg-white">
                            <Table className="w-full text-left">
                                <TableHeader className="bg-surface-sunken">
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-line">
                                    {users.map((user) => (
                                        <TableRow key={user.id} className="transition-colors hover:bg-surface-sunken/70">
                                            <TableCell className="font-medium text-ink">{user.full_name}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{user.email}</div>
                                                <div className="text-caption text-ink-soft">{user.phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' || user.role === 'ADMIN' ? 'royal' : 'outline'}>
                                                    {user.role.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                                                    {user.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="num text-ink-soft">
                                                {dateLong(user.created_at)}
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
