'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* ============================================================
   PAGE F1: SYSTEM ADMIN DASHBOARD
   Route:     /admin/dashboard
   Access:    SYSTEM_ADMIN / admin only
   Spec:      SYSTEM_FEATURES_MASTER.md Section F1

   Feature Tree:
     Admin Dashboard
     ├── Stat Cards (4): Total Issues, Users, Resolution Rate, Avg Rating
     ├── Filter Bar: Status + Priority
     ├── Department Performance Bars
     ├── Issues Table with Quick Actions (Acknowledge, Assign, Reject)
     └── Citizen Satisfaction Section
   ============================================================ */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'submitted': 'bg-gray-500/20 text-gray-400 border border-gray-500/40',
    'acknowledged': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border border-green-500/40',
    'rejected': 'bg-red-500/20 text-red-400 border border-red-500/40',
};
const PRIORITY_STYLES = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

function AdminDashboardContent() {
    const [issues, setIssues] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [stats, setStats] = useState({ totalIssues: 0, totalUsers: 0, departmentStats: {}, avgRating: 0, totalRatings: 0 });

    const inputCls = "bg-input border border-border rounded-input text-white px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            let issuesData = null;
            try {
                const res = await fetch('/api/issues/admin');
                if (res.ok) { const d = await res.json(); issuesData = d.issues || d; }
            } catch {}
            if (!issuesData) {
                try { const res = await fetch('/api/issues'); if (res.ok) { const d = await res.json(); issuesData = d.issues || d; } } catch {}
            }
            setIssues(Array.isArray(issuesData) ? issuesData : []);

            const dRes = await fetch('/api/departments');
            if (dRes.ok) setDepartments(await dRes.json());

            const sRes = await fetch('/api/stats');
            if (sRes.ok) {
                const sd = await sRes.json();
                const ds = (sd.departmentStats || []).reduce((a, d) => { a[d._id] = { total: d.total, resolved: d.resolved, pending: d.pending }; return a; }, {});
                const rated = (sd.recentIssues || []).filter(i => i.feedback?.rating);
                const avg = rated.length > 0 ? (rated.reduce((s, i) => s + i.feedback.rating, 0) / rated.length).toFixed(1) : 0;
                setStats({ totalIssues: sd.totalIssues, totalUsers: sd.totalUsers, departmentStats: ds, avgRating: avg, totalRatings: rated.length });
            }
        } catch { toast.error('Failed to load data'); setIssues([]); }
        finally { setLoading(false); }
    };

    const resRate = () => {
        if (!stats.totalIssues) return 0;
        return Math.round(Object.values(stats.departmentStats).reduce((a, d) => a + d.resolved, 0) / stats.totalIssues * 100);
    };

    const handleQuickAction = async (id, action, data = {}) => {
        setActionLoading(p => ({ ...p, [id]: action }));
        try {
            const res = await fetch(`/api/issues/${id}/quick-action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...data }) });
            if (res.ok) { toast.success(`Issue ${action}d`); fetchData(); }
            else { const e = await res.json(); toast.error(e.error || 'Failed'); }
        } catch { toast.error('Failed'); }
        finally { setActionLoading(p => ({ ...p, [id]: null })); }
    };

    const filteredIssues = issues.filter(i => (filterStatus === 'all' || i.status === filterStatus) && (filterPriority === 'all' || i.priority === filterPriority));

    const statCards = [
        { label: 'Total Issues', value: stats.totalIssues, icon: '📊' },
        { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
        { label: 'Resolution Rate', value: `${resRate()}%`, icon: '✅' },
        { label: 'Avg Rating', value: stats.totalRatings > 0 ? `${stats.avgRating} ⭐` : 'N/A', icon: '⭐' },
    ];

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-text-secondary text-sm mt-1">System-wide issue management</p>
                    </div>
                    <div className="flex gap-3">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}>
                            <option value="all">All ({issues.length})</option>
                            <option value="submitted">Submitted</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={inputCls}>
                            <option value="all">All Priorities</option>
                            <option value="urgent">🔴 Urgent</option>
                            <option value="high">🟠 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {statCards.map(s => (
                        <div key={s.label} className="stat-card">
                            <span className="text-xl mb-2 block">{s.icon}</span>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Department Performance */}
                {Object.keys(stats.departmentStats).length > 0 && (
                    <div className="bg-card rounded-card border border-border p-5">
                        <h2 className="section-header">Department Performance</h2>
                        <div className="space-y-4 mt-4">
                            {Object.entries(stats.departmentStats).map(([dept, data]) => (
                                <div key={dept}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white capitalize">{dept}</span>
                                        <span className="text-text-muted">{data.resolved}/{data.total}</span>
                                    </div>
                                    <div className="w-full bg-border rounded-full h-2">
                                        <div className="bg-gold h-2 rounded-full transition-all" style={{ width: `${data.total ? Math.round(data.resolved / data.total * 100) : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Issues Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="section-header mb-0">Issues Management</h2>
                        <span className="text-xs text-text-muted">{filteredIssues.length} issues</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead>
                                <tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filteredIssues.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-text-secondary">No issues found</td></tr>
                                ) : filteredIssues.map(issue => (
                                    <tr key={issue._id}>
                                        <td><Link href={`/issues/${issue.reportId || issue._id}`} className="report-id hover:underline">{issue.reportId}</Link></td>
                                        <td>
                                            <div className="text-white text-sm max-w-[180px] truncate">{issue.title}</div>
                                            <div className="text-text-muted text-xs truncate max-w-[180px]">{issue.location?.address?.substring(0, 40)}</div>
                                        </td>
                                        <td className="text-text-secondary text-xs capitalize">{issue.category}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status] || ''}`}>{issue.status}</span></td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                                        <td>
                                            <div className="flex items-center gap-1.5">
                                                {issue.status === 'submitted' && (
                                                    <button onClick={() => handleQuickAction(issue._id, 'acknowledge')} disabled={!!actionLoading[issue._id]}
                                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-pill text-xs hover:bg-blue-500/30 disabled:opacity-50">
                                                        {actionLoading[issue._id] === 'acknowledge' ? '...' : '✓'}
                                                    </button>
                                                )}
                                                {['submitted', 'acknowledged'].includes(issue.status) && (
                                                    <select onChange={e => handleQuickAction(issue._id, 'assign', { departmentId: e.target.value })} disabled={!!actionLoading[issue._id]}
                                                        className="bg-transparent border border-border rounded-pill text-xs px-2 py-1 text-text-secondary focus:border-gold focus:outline-none" defaultValue="">
                                                        <option value="" disabled>Assign</option>
                                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                    </select>
                                                )}
                                                {!['rejected', 'resolved'].includes(issue.status) && (
                                                    <button onClick={() => { const r = window.prompt('Reason:'); if (r !== null) handleQuickAction(issue._id, 'reject', { reason: r }); }}
                                                        disabled={!!actionLoading[issue._id]}
                                                        className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-pill text-xs hover:bg-red-500/30 disabled:opacity-50">
                                                        ✗
                                                    </button>
                                                )}
                                                <Link href={`/issues/${issue.reportId || issue._id}`} className="text-gold hover:underline text-xs">→</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Citizen Satisfaction */}
                <div className="bg-card rounded-card border border-border p-5">
                    <h2 className="section-header">Citizen Satisfaction</h2>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-input rounded-input p-6 text-center">
                            <div className="text-3xl font-bold text-gold mb-1">{stats.totalRatings > 0 ? stats.avgRating : 'N/A'}</div>
                            <div className="text-xs text-text-muted">Average Rating ({stats.totalRatings} reviews)</div>
                        </div>
                        <div className="bg-input rounded-input p-6 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{stats.totalRatings}</div>
                            <div className="text-xs text-text-muted">Total Feedbacks</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminDashboard() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <AdminDashboardContent />
        </DashboardProtection>
    );
}