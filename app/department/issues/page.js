'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';

/* ============================================================
   PAGE C2: FIELD OFFICER — ASSIGNED ISSUES
   Route:     /department/issues
   Access:    FIELD_OFFICER only
   Spec:      SYSTEM_FEATURES_MASTER.md Section C2

   Feature Tree:
     Issues Page
     ├── Page Header "My Assigned Issues"
     ├── Filter Pills: Status + Priority + Search
     └── Issues Table
         └── Each row: ID | Title | Status | Priority | Reported | [View →]

   API: GET /api/issues/department
   Same endpoint as dashboard — frontend filters to non-resolved
   ============================================================ */

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
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function FOIssuesContent() {
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/issues/department');
                const d = await res.json();
                if (d.success) setAllIssues(d.issues || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
        const i = setInterval(load, 30000);
        return () => clearInterval(i);
    }, []);

    // Filter to active (non-resolved) issues only, then apply user filters
    const issues = useMemo(() => {
        let filtered = allIssues.filter(i => i.status !== 'resolved');
        if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
        if (filters.priority) filtered = filtered.filter(i => i.priority === filters.priority);
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(i =>
                (i.reportId || '').toLowerCase().includes(q) ||
                (i.title || '').toLowerCase().includes(q)
            );
        }
        // Sort: urgent first, then by date
        filtered.sort((a, b) => {
            const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            const pa = pOrder[a.priority] ?? 4;
            const pb = pOrder[b.priority] ?? 4;
            if (pa !== pb) return pa - pb;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return filtered;
    }, [allIssues, filters]);

    const inputCls = "w-full bg-input border border-border rounded-input text-white placeholder:text-text-muted px-4 py-2.5 focus:border-gold focus:outline-none transition-colors text-sm";

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Assigned Issues</h1>
                    <p className="text-text-secondary text-sm mt-1">All active issues assigned to you</p>
                </div>

                {/* Filters */}
                <div className="bg-card rounded-card border border-border p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                        </select>
                        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} className={inputCls}>
                            <option value="">All Priorities</option>
                            <option value="urgent">🔴 Urgent</option>
                            <option value="high">🟠 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                        <input
                            type="text" placeholder="Search by ID or Title..."
                            value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                            className={inputCls}
                        />
                    </div>
                </div>

                <div className="text-xs text-text-muted">
                    Showing {issues.length} active issues
                </div>

                {/* Issues Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Reported</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12">
                                        <span className="text-3xl block mb-3">📭</span>
                                        <span className="text-text-secondary">No assigned issues match your filters</span>
                                    </td></tr>
                                ) : issues.map(issue => (
                                    <tr key={issue._id}>
                                        <td><span className="report-id">{issue.reportId}</span></td>
                                        <td className="max-w-[200px] truncate">{issue.title}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span></td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                                        <td className="text-text-muted text-xs whitespace-nowrap">{timeAgo(issue.createdAt)}</td>
                                        <td>
                                            <Link
                                                href={`/issues/${issue._id}`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-full text-xs font-bold transition-colors"
                                            >
                                                View & Update →
                                            </Link>
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

export default function DepartmentIssues() {
    return (
        <DashboardProtection allowedRoles={['FIELD_OFFICER', 'department']}>
            <FOIssuesContent />
        </DashboardProtection>
    );
}
