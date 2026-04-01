'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import { DEPARTMENTS, ZONES, WARD_MAP } from '@/lib/wards';
import Link from 'next/link';

function MunicipalDashboardContent() {
    const { user } = useUser();
    const [issues, setIssues] = useState([]);
    const [wardStats, setWardStats] = useState([]);
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute for SLA countdown
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            const [issuesRes, wardStatsRes, statsRes] = await Promise.all([
                fetch('/api/issues'),
                fetch('/api/issues/ward-stats'),
                fetch('/api/issues/stats')
            ]);

            const [issuesJson, wardStatsJson, statsJson] = await Promise.all([
                issuesRes.json(),
                wardStatsRes.json(),
                statsRes.json()
            ]);

            if (issuesJson.success) {
                setIssues(issuesJson.data || []);
            } else if (issuesJson.error) {
                toast.error(issuesJson.error);
            }

            if (wardStatsJson.success) {
                setWardStats(wardStatsJson.data || []);
            } else if (wardStatsJson.error) {
                toast.error(wardStatsJson.error);
            }

            if (statsJson.success) {
                setStatsData(statsJson.data);
            } else if (statsJson.error) {
                toast.error(statsJson.error);
            }

        } catch (err) {
            console.error('Dashboard fetch error:', err);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Get SLA time remaining color
    const getSlaColor = (deadline) => {
        if (!deadline) return 'text-gray-400';
        const diff = new Date(deadline) - currentTime;
        const hours = diff / (1000 * 60 * 60);
        if (hours < 2) return 'text-red-400';
        if (hours < 12) return 'text-amber-400';
        return 'text-green-400';
    };

    // Format SLA countdown
    const formatSlaCountdown = (deadline) => {
        if (!deadline) return '—';
        const diff = new Date(deadline) - currentTime;
        if (diff <= 0) return 'OVERDUE';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    // Commissioner View - City-wide
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <PageHeader
                    title="Municipal Operations Center"
                    subtitle="City-wide overview and performance metrics"
                >
                    <div className="flex gap-2">
                        <button onClick={fetchDashboardData} className="btn-outline text-xs">Refresh</button>
                    </div>
                </PageHeader>

                {/* STATS - Commissioner */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Issues" value={statsData?.total || 0} icon="📋" />
                    <StatCard label="In Progress" value={statsData?.inProgress || 0} icon="🔄" />
                    <StatCard label="Resolved" value={statsData?.resolved || 0} icon="✅" />
                    <StatCard label="Overdue" value={statsData?.overdue || 0} icon="⚠️" trend={statsData?.overdue > 0 ? 'down' : 'up'} />
                </div>

                {/* WARD PERFORMANCE GRID - Commissioner */}
                <div>
                    <h2 className="section-header mb-6">Ward Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {wardStats.map(ward => {
                            const rate = ward.total > 0 ? Math.round((ward.resolved / ward.total) * 100) : 0;
                            const wardInfo = WARD_MAP[ward.wardId];
                            const zoneColor = ward.zone === 'north' ? 'bg-blue-500/10 text-blue-400' : 'bg-teal-500/10 text-teal-400';
                            
                            return (
                                <div key={ward.wardId} className="card p-4 hover:border-gold/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${zoneColor}`}>
                                            {ward.zone?.toUpperCase() || 'UNKNOWN'}
                                        </span>
                                        <span className="text-sm font-medium text-text-secondary">
                                            Ward {ward.wardNumber || '?'}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1">
                                        {wardInfo?.wardNumber ? `Ward ${wardInfo.wardNumber}` : ward.wardId}
                                    </h4>

                                    <div className="mt-3 py-2 border-y border-border/50 text-[11px] space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Field Officer:</span>
                                            <span className="text-gold font-medium">{ward.officer?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Department:</span>
                                            <span className="text-text-secondary text-[10px]">
                                                {DEPARTMENTS[ward.departmentId]?.name || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-4">
                                        <div className="text-xs text-text-muted">
                                            <span className="text-white font-bold">{ward.total}</span> issues
                                        </div>
                                        <div className={`text-xs font-bold ${rate > 80 ? 'text-green-400' : rate > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {rate}% resolv.
                                        </div>
                                    </div>
                                    <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${rate > 80 ? 'bg-green-500' : rate > 50 ? 'bg-gold' : 'bg-red-500'}`}
                                            style={{ width: `${rate}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RECENT ISSUES - Commissioner */}
                <div className="card">
                    <h3 className="section-header mb-6">Critical Feedback Loop</h3>
                    <div className="overflow-x-auto">
                        <table className="table-dark">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Ward</th>
                                    <th>Status</th>
                                    <th>SLA</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.slice(0, 10).map(issue => {
                                    const wardInfo = WARD_MAP[issue.ward];
                                    return (
                                        <tr key={issue._id}>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="report-id text-[10px]">{issue.reportId}</span>
                                                    <span className="font-medium truncate max-w-[200px]">{issue.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs">
                                                    Ward {wardInfo?.wardNumber || issue.ward}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${issue.status}`}>
                                                    {issue.status?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`text-xs ${getSlaColor(issue.sla?.deadline)}`}>
                                                    {formatSlaCountdown(issue.sla?.deadline)}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/issues/${issue._id}`} className="text-gold text-xs font-bold hover:underline">
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function MunicipalDashboard() {
    return (
        <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER', 'commissioner', 'COMMISSIONER']}>
            <MunicipalDashboardContent />
        </DashboardProtection>
    );
}
