'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';

/* ============================================================
   PAGE C3: FIELD OFFICER — RESOLVED ISSUES
   Route:     /department/resolved
   Access:    FIELD_OFFICER only
   Spec:      SYSTEM_FEATURES_MASTER.md Section C3

   Feature Tree:
     Resolved Issues Page
     ├── Page Header "Resolved Issues"
     ├── Summary Row: Total Resolved | This Month | Avg Resolution
     └── Resolved Issues Table
         └── Each row: ID | Title | Priority | Resolved Date | Rating | [View →]

   API: GET /api/issues/department
   Frontend filters to status === 'resolved'
   ============================================================ */

const PRIORITY_STYLES = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function FOResolvedContent() {
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

    // Resolved issues only, sorted by most recently resolved first
    const resolved = useMemo(() => {
        return allIssues
            .filter(i => i.status === 'resolved')
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [allIssues]);

    // Summary stats
    const summary = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = resolved.filter(i => new Date(i.updatedAt) >= startOfMonth);
        const avgHours = resolved.length > 0
            ? Math.round(resolved.reduce((sum, i) => sum + (i.resolutionTime || 0), 0) / resolved.length)
            : 0;
        return {
            total: resolved.length,
            thisMonth: thisMonth.length,
            avgResolution: avgHours > 0 ? `${avgHours}h` : '—'
        };
    }, [resolved]);

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
                    <h1 className="text-2xl font-bold text-white">Resolved Issues</h1>
                    <p className="text-text-secondary text-sm mt-1">Issues you&apos;ve successfully resolved</p>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-3 gap-4 stagger-children">
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">✅</span>
                        <div className="stat-value">{summary.total}</div>
                        <div className="stat-label">Total Resolved</div>
                    </div>
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">📅</span>
                        <div className="stat-value">{summary.thisMonth}</div>
                        <div className="stat-label">This Month</div>
                    </div>
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">⏱️</span>
                        <div className="stat-value">{summary.avgResolution}</div>
                        <div className="stat-label">Avg Resolution</div>
                    </div>
                </div>

                {/* Resolved Issues Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Title</th>
                                    <th>Priority</th>
                                    <th>Resolved Date</th>
                                    <th>Citizen Rating</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {resolved.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12">
                                        <span className="text-3xl block mb-3">✅</span>
                                        <span className="text-text-secondary">No resolved issues yet</span>
                                    </td></tr>
                                ) : resolved.map(issue => (
                                    <tr key={issue._id}>
                                        <td><span className="report-id">{issue.reportId}</span></td>
                                        <td className="max-w-[200px] truncate">{issue.title}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                                        <td className="text-text-muted text-xs whitespace-nowrap">{formatDate(issue.updatedAt)}</td>
                                        <td className="text-sm">
                                            {issue.feedback?.rating
                                                ? <span className="text-gold">{'⭐'.repeat(issue.feedback.rating)}</span>
                                                : <span className="text-text-muted">—</span>
                                            }
                                        </td>
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

export default function DepartmentResolved() {
    return (
        <DashboardProtection allowedRoles={['FIELD_OFFICER', 'department']}>
            <FOResolvedContent />
        </DashboardProtection>
    );
}
