'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE F3: Admin — Department Management */

function DepartmentsContent() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const inputCls = "bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    const fetchDepts = useCallback(async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) setDepartments(await res.json());
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchDepts(); }, [fetchDepts]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name || name.length < 2) { toast.error('Name too short'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
            if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
            toast.success('Department created'); setNewName(''); fetchDepts();
        } catch (e) { toast.error(e.message); }
        finally { setCreating(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this department?')) return;
        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Deleted'); fetchDepts();
        } catch { toast.error('Failed'); }
    };

    if (loading) return (
        <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div></DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Department Management</h1>
                    <p className="text-text-secondary text-sm mt-1">Create and manage system departments</p>
                </div>

                {/* Create */}
                <form onSubmit={handleCreate} className="bg-card rounded-card border border-border p-5">
                    <h2 className="section-header">Create New Department</h2>
                    <div className="flex gap-3 mt-3">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Department name..." className={`${inputCls} flex-1`} />
                        <button type="submit" disabled={creating} className="btn-gold px-6 py-2.5 text-sm disabled:opacity-50">
                            {creating ? '...' : '+ Create'}
                        </button>
                    </div>
                </form>

                {/* List */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>Name</th><th>Staff</th><th>Created</th><th></th></tr></thead>
                            <tbody>
                                {departments.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-8 text-text-secondary">No departments</td></tr>
                                ) : departments.map(d => (
                                    <tr key={d._id}>
                                        <td className="text-white font-medium">{d.name}</td>
                                        <td className="text-text-muted">{d.staffCount || 0}</td>
                                        <td className="text-text-muted text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button onClick={() => handleDelete(d._id)} className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-pill text-xs hover:bg-red-500/30">
                                                Delete
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

export default function AdminDepartments() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <DepartmentsContent />
        </DashboardProtection>
    );
}
