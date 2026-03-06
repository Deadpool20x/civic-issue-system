'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';

export default function DepartmentDashboard() {
    const { user } = useUser();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/issues/department');
            const data = await res.json();
            if (data.success) {
                setIssues(data.issues || []);
            }
        } catch (err) {
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const filteredIssues = useMemo(() => {
        if (filter === 'active') return issues.filter(i => ['assigned', 'in-progress', 'reopened'].includes(i.status));
        if (filter === 'resolved') return issues.filter(i => i.status === 'resolved');
        return issues;
    }, [issues, filter]);

    const stats = useMemo(() => {
        const active = issues.filter(i => ['assigned', 'in-progress'].includes(i.status)).length;
        const resolved = issues.filter(i => i.status === 'resolved').length;
        const urgent = issues.filter(i => i.priority === 'urgent' && i.status !== 'resolved').length;
        return { active, resolved, urgent };
    }, [issues]);

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
                    title={`${user?.wardId?.toUpperCase() || 'Field'} Operations`}
                    subtitle={`Logged in as ${user?.name}. Managing ${user?.departmentId?.toUpperCase()} issues for your assigned ward.`}
                >
                    <div className="flex gap-2">
                        <button onClick={fetchData} className="btn-outline">Refresh</button>
                        <Link href="/department/profile" className="btn-gold">My Profile</Link>
                    </div>
                </PageHeader>

                {/* ── STATS ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Active Tasks" value={stats.active} icon="🔄" />
                    <StatCard label="Resolved Today" value={stats.resolved} icon="✅" />
                    <StatCard label="Critical SLA" value={stats.urgent} icon="⚠️" />
                </div>

                {/* ── SLA QUEUE ── */}
                <div className="card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h3 className="section-header !mb-0">Priority SLA Queue</h3>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            <button
                                onClick={() => setFilter('active')}
                                className={`pill ${filter === 'active' ? 'pill-active' : 'pill-inactive'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilter('resolved')}
                                className={`pill ${filter === 'resolved' ? 'pill-active' : 'pill-inactive'}`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table-dark">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>SLA Countdown</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIssues.length > 0 ? filteredIssues.map(issue => {
                                    const hoursLeft = issue.sla?.deadline ? Math.round((new Date(issue.sla.deadline) - Date.now()) / 3600000) : null;
                                    return (
                                        <tr key={issue._id} className="group">
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="report-id text-[10px]">{issue.reportId}</span>
                                                    <span className="font-medium group-hover:text-gold transition-colors">{issue.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${issue.status === 'in-progress' ? 'progress' : issue.status}`}>
                                                    {issue.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${issue.priority}`}>
                                                    {issue.priority.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                {hoursLeft !== null ? (
                                                    <span className={`text-xs font-bold ${hoursLeft < 6 ? 'text-red-400' : hoursLeft < 24 ? 'text-amber-400' : 'text-green-400'}`}>
                                                        {hoursLeft > 0 ? `${hoursLeft}h remaining` : 'OVERDUE'}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td>
                                                <Link href={`/issues/${issue._id}`} className="text-gold text-xs font-bold hover:underline">
                                                    Go to Work →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-text-secondary">
                                            No issues found in this queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
