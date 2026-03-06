'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';

/* ============================================================
   PAGE C4: FIELD OFFICER — PERFORMANCE / STATS
   Route:     /department/stats
   Access:    FIELD_OFFICER only
   Spec:      SYSTEM_FEATURES_MASTER.md Section C4

   Feature Tree:
     My Performance Page
     ├── Page Header "My Performance"
     ├── Stat Cards (5 cards)
     │   ├── Total Issues (all time)
     │   ├── Pending
     │   ├── In Progress
     │   ├── Resolved
     │   └── High Priority
     ├── This Month Summary
     │   ├── Resolved this month
     │   ├── Avg resolution time
     │   └── SLA compliance %
     └── Performance Badge Section (placeholder)

   API: GET /api/issues/department
   All data calculated on frontend from response (Option B)
   ============================================================ */

function FOStatsContent() {
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
        const i = setInterval(load, 60000);
        return () => clearInterval(i);
    }, []);

    // All-time stats
    const stats = useMemo(() => {
        const pending = allIssues.filter(i => i.status === 'pending' || i.status === 'assigned').length;
        const inProgress = allIssues.filter(i => i.status === 'in-progress').length;
        const resolved = allIssues.filter(i => i.status === 'resolved').length;
        const highPriority = allIssues.filter(i => i.priority === 'urgent' || i.priority === 'high').length;
        return [
            { label: 'Total Issues', value: allIssues.length, icon: '📊' },
            { label: 'Pending', value: pending, icon: '⏳' },
            { label: 'In Progress', value: inProgress, icon: '🔄' },
            { label: 'Resolved', value: resolved, icon: '✅' },
            { label: 'High Priority', value: highPriority, icon: '🔴' },
        ];
    }, [allIssues]);

    // This month summary
    const monthly = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const resolvedThisMonth = allIssues.filter(i =>
            i.status === 'resolved' && new Date(i.updatedAt) >= startOfMonth
        );
        const avgHours = resolvedThisMonth.length > 0
            ? Math.round(resolvedThisMonth.reduce((sum, i) => sum + (i.resolutionTime || 0), 0) / resolvedThisMonth.length)
            : 0;

        // SLA compliance: resolved before deadline
        const resolvedAll = allIssues.filter(i => i.status === 'resolved');
        const onTime = resolvedAll.filter(i => {
            if (!i.sla?.deadline || !i.updatedAt) return false;
            return new Date(i.updatedAt) <= new Date(i.sla.deadline);
        });
        const slaCompliance = resolvedAll.length > 0
            ? Math.round((onTime.length / resolvedAll.length) * 100)
            : 0;

        return {
            resolvedThisMonth: resolvedThisMonth.length,
            avgResolution: avgHours > 0 ? `${avgHours}h` : '—',
            slaCompliance: `${slaCompliance}%`
        };
    }, [allIssues]);

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
                    <h1 className="text-2xl font-bold text-white">My Performance</h1>
                    <p className="text-text-secondary text-sm mt-1">Your performance overview</p>
                </div>

                {/* All-time Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
                    {stats.map(c => (
                        <div key={c.label} className="stat-card">
                            <span className="text-xl mb-2 block">{c.icon}</span>
                            <div className="stat-value">{c.value}</div>
                            <div className="stat-label">{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* This Month Summary */}
                <div className="bg-card rounded-card border border-border p-6">
                    <h2 className="section-header mb-4">This Month</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Resolved</p>
                            <p className="text-2xl font-bold text-white">{monthly.resolvedThisMonth}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Avg Resolution Time</p>
                            <p className="text-2xl font-bold text-white">{monthly.avgResolution}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">SLA Compliance</p>
                            <p className="text-2xl font-bold text-gold">{monthly.slaCompliance}</p>
                        </div>
                    </div>
                </div>

                {/* Badge Section (placeholder for now) */}
                <div className="bg-card rounded-card border border-border p-6">
                    <h2 className="section-header mb-4">Badges</h2>
                    <div className="text-center py-8">
                        <span className="text-3xl block mb-3">🏅</span>
                        <p className="text-text-secondary text-sm">No badges earned yet — keep resolving issues!</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function DepartmentStats() {
    return (
        <DashboardProtection allowedRoles={['FIELD_OFFICER', 'department']}>
            <FOStatsContent />
        </DashboardProtection>
    );
}
