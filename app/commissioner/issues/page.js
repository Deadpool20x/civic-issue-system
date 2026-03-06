'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE E2: Commissioner — All Issues (filterable) */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border border-green-500/40',
    'rejected': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'escalated': 'bg-red-600/20 text-red-300 border border-red-600/40',
};
const PRIORITY_STYLES = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

function timeAgo(date) {
    const h = Math.floor((Date.now() - new Date(date)) / 3600000);
    if (h < 1) return 'just now'; if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
}

function CommissionerIssuesContent() {
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', priority: '', department: '', search: '' });
    const inputCls = "bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/issues', { credentials: 'include' });
                if (res.ok) { const d = await res.json(); setAllIssues(Array.isArray(d) ? d : d.issues || []); }
            } catch { toast.error('Failed to load issues'); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = [...allIssues];
        if (filters.status) list = list.filter(i => i.status === filters.status);
        if (filters.priority) list = list.filter(i => i.priority === filters.priority);
        if (filters.department) list = list.filter(i => i.assignedDepartment === filters.department);
        if (filters.search) { const q = filters.search.toLowerCase(); list = list.filter(i => (i.reportId || '').toLowerCase().includes(q) || (i.title || '').toLowerCase().includes(q)); }
        return list;
    }, [allIssues, filters]);

    const departments = useMemo(() => [...new Set(allIssues.map(i => i.assignedDepartment).filter(Boolean))], [allIssues]);

    if (loading) return (
        <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div></DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">All City Issues</h1>
                    <p className="text-text-secondary text-sm mt-1">Complete issue registry across all departments and wards</p>
                </div>

                <div className="bg-card rounded-card border border-border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option><option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option><option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option><option value="escalated">Escalated</option>
                        </select>
                        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} className={inputCls}>
                            <option value="">All Priorities</option>
                            <option value="urgent">🔴 Urgent</option><option value="high">🟠 High</option>
                            <option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
                        </select>
                        <select value={filters.department} onChange={e => setFilters(p => ({ ...p, department: e.target.value }))} className={inputCls}>
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <input type="text" placeholder="Search ID or title..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className={inputCls} />
                    </div>
                </div>

                <div className="text-xs text-text-muted">Showing {filtered.length} of {allIssues.length} issues</div>

                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>ID</th><th>Title</th><th>Department</th><th>Status</th><th>Priority</th><th>Reported</th><th></th></tr></thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-12 text-text-secondary">No issues match filters</td></tr>
                                ) : filtered.map(issue => (
                                    <tr key={issue._id}>
                                        <td><span className="report-id">{issue.reportId || '—'}</span></td>
                                        <td className="max-w-[200px] truncate text-white">{issue.title}</td>
                                        <td className="capitalize text-text-secondary text-xs">{issue.assignedDepartment || '—'}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span></td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                                        <td className="text-text-muted text-xs whitespace-nowrap">{timeAgo(issue.createdAt)}</td>
                                        <td><Link href={`/issues/${issue._id}`} className="text-gold hover:underline text-xs font-medium">View →</Link></td>
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

export default function CommissionerIssuesPage() {
    return (
        <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER', 'commissioner']}>
            <CommissionerIssuesContent />
        </DashboardProtection>
    );
}
