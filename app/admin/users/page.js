'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE F2: Admin — User Management */

const ROLE_BADGE = {
    citizen: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    department: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    municipal: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
    admin: 'bg-gold/20 text-gold border border-gold/40',
    commissioner: 'bg-red-500/20 text-red-400 border border-red-500/40',
};

function UsersContent() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const inputCls = "bg-input border border-border rounded-input text-white px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users/admin');
            if (res.ok) setUsers(await res.json());
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUsers();
        (async () => { try { const r = await fetch('/api/departments'); if (r.ok) setDepartments(await r.json()); } catch {} })();
    }, [fetchUsers]);

    const handleToggle = async (id, active) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !active }) });
            if (!res.ok) throw new Error();
            toast.success('Status updated'); fetchUsers();
        } catch { toast.error('Failed'); }
    };

    const handleRoleChange = async (id, role) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
            if (!res.ok) throw new Error();
            toast.success('Role updated'); fetchUsers();
        } catch { toast.error('Failed'); }
    };

    const handleDeptChange = async (id, deptId) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ department: deptId }) });
            if (!res.ok) throw new Error();
            toast.success('Department updated'); fetchUsers();
        } catch { toast.error('Failed'); }
    };

    const filtered = users.filter(u => filter === 'all' || u.role === filter);
    const stats = users.reduce((a, u) => { a[u.role] = (a[u.role] || 0) + 1; return a; }, {});

    if (loading) return (
        <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div></DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">User Management</h1>
                        <p className="text-text-secondary text-sm mt-1">Manage all system users</p>
                    </div>
                    <Link href="/admin/users/create" className="btn-gold px-4 py-2 text-sm">+ Create Staff User</Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {[
                        { label: 'Total', value: users.length, icon: '👥' },
                        { label: 'Citizens', value: stats.citizen || 0, icon: '🏠' },
                        { label: 'Staff', value: (stats.municipal || 0) + (stats.department || 0), icon: '🏢' },
                        { label: 'Admins', value: stats.admin || 0, icon: '🔑' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <span className="text-xl mb-2 block">{s.icon}</span>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="bg-card rounded-card border border-border p-4">
                    <select value={filter} onChange={e => setFilter(e.target.value)} className={inputCls}>
                        <option value="all">All Users</option>
                        <option value="citizen">Citizens</option>
                        <option value="municipal">Municipal Staff</option>
                        <option value="department">Department Staff</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="text-white text-sm font-medium">{u.name}</div>
                                            <div className="text-text-muted text-xs">{u.email}</div>
                                        </td>
                                        <td>
                                            <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} disabled={u.role === 'admin'}
                                                className="bg-transparent border border-border rounded-pill text-xs px-2 py-1 text-white focus:border-gold focus:outline-none disabled:opacity-50">
                                                <option value="citizen">Citizen</option>
                                                <option value="municipal">Municipal</option>
                                                <option value="department">Department</option>
                                                {u.role === 'admin' && <option value="admin">Admin</option>}
                                            </select>
                                        </td>
                                        <td>
                                            {u.role === 'department' ? (
                                                <select value={u.department?._id || u.department || ''} onChange={e => handleDeptChange(u._id, e.target.value)}
                                                    className="bg-transparent border border-border rounded-pill text-xs px-2 py-1 text-white focus:border-gold focus:outline-none">
                                                    <option value="">Select</option>
                                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                </select>
                                            ) : <span className="text-text-muted text-xs">—</span>}
                                        </td>
                                        <td>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => handleToggle(u._id, u.isActive)} disabled={u.role === 'admin'}
                                                className={`px-2 py-1 rounded-pill text-xs font-medium disabled:opacity-50 ${u.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminUsersPage() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <UsersContent />
        </DashboardProtection>
    );
}
