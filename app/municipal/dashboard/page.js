'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';

export default function MunicipalDashboard() {
    const { user } = useUser();
    const [issues, setIssues] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch all issues (scoped by roleFilter on server)
            const issuesRes = await fetch('/api/issues');
            const issuesData = await issuesRes.json();
            setIssues(issuesData.issues || []);

            // Fetch ward info
            const wardsRes = await fetch('/api/wards');
            const wardsData = await wardsRes.json();
            setWards(wardsData.all || []);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const stats = useMemo(() => {
        const total = issues.length;
        const pending = issues.filter(i => ['pending', 'assigned', 'in-progress'].includes(i.status)).length;
        const resolved = issues.filter(i => i.status === 'resolved').length;
        const overdue = issues.filter(i => i.sla?.isOverdue).length;

        return { total, pending, resolved, overdue };
    }, [issues]);

    // Group issues by ward for the 16-ward grid
    const wardPerformance = useMemo(() => {
        return wards.map(ward => {
            const wardIssues = issues.filter(i => i.ward === ward.wardId);
            const resolved = wardIssues.filter(i => i.status === 'resolved').length;
            const total = wardIssues.length;
            const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            return {
                ...ward,
                total,
                resolved,
                rate
            };
        });
    }, [wards, issues]);

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <PageHeader
                    title="Departmental Hub"
                    subtitle={`Managing ${user?.departmentId?.toUpperCase() || 'Municipal'} operations across all 16 city wards.`}
                >
                    <div className="flex gap-2">
                        <button className="btn-outline">SLA Alerts</button>
                        <button className="btn-gold">Reports</button>
                    </div>
                </PageHeader>

                {/* ── STATS ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Active" value={stats.pending} icon="📋" />
                    <StatCard label="Resolved" value={stats.resolved} icon="✅" />
                    <StatCard label="Overdue" value={stats.overdue} icon="⚠️" />
                    <StatCard label="Avg. Health" value={`${issues.length > 0 ? Math.round((stats.resolved / issues.length) * 100) : 0}%`} icon="📈" />
                </div>

                {/* ── WARD PERFORMANCE GRID (16 CARDS) ── */}
                <div>
                    <h2 className="section-header mb-6">Ward Distribution & Performance</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {wardPerformance.map(ward => (
                            <div key={ward.wardId} className="card p-4 hover:border-gold/30 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ward.zone === 'North Zone' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {ward.zone === 'North' ? 'NZ' : 'SZ'}
                                    </span>
                                    <span className="text-xl group-hover:scale-110 transition-transform">🏢</span>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1 truncate">{ward.wardName}</h4>
                                <div className="flex items-end justify-between mt-4">
                                    <div className="text-xs text-text-muted">
                                        <span className="text-white font-bold">{ward.total}</span> total
                                    </div>
                                    <div className={`text-xs font-bold ${ward.rate > 80 ? 'text-green-400' : ward.rate > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {ward.rate}%
                                    </div>
                                </div>
                                {/* Mini progress bar */}
                                <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${ward.rate > 80 ? 'bg-green-500' : ward.rate > 50 ? 'bg-gold' : 'bg-red-500'}`}
                                        style={{ width: `${ward.rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RECENT ESCALATIONS ── */}
                <div className="card">
                    <h3 className="section-header mb-6">Critical Feedback Loop</h3>
                    <div className="overflow-x-auto">
                        <table className="table-dark">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Ward</th>
                                    <th>Staff</th>
                                    <th>SLA Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.filter(i => i.priority === 'urgent' || i.status === 'escalated').slice(0, 5).map(issue => (
                                    <tr key={issue._id}>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="report-id text-[10px]">{issue.reportId}</span>
                                                <span className="font-medium">{issue.title}</span>
                                            </div>
                                        </td>
                                        <td>{issue.ward}</td>
                                        <td>{issue.assignedStaff ? 'Assigned' : 'Unassigned'}</td>
                                        <td>
                                            <span className={`badge ${issue.sla?.isOverdue ? 'badge-urgent' : 'badge-progress'}`}>
                                                {issue.sla?.isOverdue ? 'OVERDUE' : 'ON TRACK'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="text-gold text-xs font-bold hover:underline">Reassign</button>
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