'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import PrivacyNotice from '@/components/PrivacyNotice';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const searchParams = useSearchParams();
    const { user } = useUser();

    const filteredIssues = useMemo(
        () => issues.filter(issue => filter === 'all' || issue.status === filter),
        [issues, filter]
    );

    const stats = useMemo(() => ([
        {
            label: 'Pending',
            value: issues.filter(i => i.status === 'pending').length,
            accent: 'border-l-4 border-l-status-warning',
            iconBg: 'bg-status-warning/10',
            iconColor: 'text-status-warning',
            iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 9 0 0118 0z'
        },
        {
            label: 'In Progress',
            value: issues.filter(i => i.status === 'in-progress').length,
            accent: 'border-l-4 border-l-brand-primary',
            iconBg: 'bg-brand-soft',
            iconColor: 'text-brand-primary',
            iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
        },
        {
            label: 'Resolved',
            value: issues.filter(i => i.status === 'resolved').length,
            accent: 'border-l-4 border-l-emerald-400',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 9 0 0118 0z'
        },
        {
            label: 'Total Issues',
            value: issues.length,
            accent: 'border-l-4 border-l-brand-primary',
            iconBg: 'bg-brand-soft',
            iconColor: 'text-brand-primary',
            iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
    ]), [issues]);

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setFilter(filterParam);
        }
    }, [searchParams]);

    const fetchIssues = useCallback(async () => {
        try {
            const response = await fetch('/api/issues', {
                credentials: 'include' // Include cookies for authentication
            });

            if (response.status === 401) {
                toast.error('Please log in to view your issues');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch issues');
            }

            const data = await response.json();
            setIssues(data);
        } catch (error) {
            console.error('Error fetching issues:', error);
            if (error.message.includes('Failed to fetch')) {
                toast.error('Network error. Please check your connection.');
            } else {
                toast.error(error.message || 'Failed to load issues');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const response = await fetch(`/api/issues/${issueId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update issue status');
            }

            toast.success('Issue status updated successfully');
            fetchIssues();
        } catch (error) {
            toast.error('Failed to update issue status');
            console.error('Error updating issue status:', error);
        }
    };
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-slate-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Privacy Notice */}
                <PrivacyNotice userRole={user?.role} showDetails={true} />

                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pt-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-contrast-primary tracking-tight">Citizen Dashboard</h1>
                        <p className="text-slate-600">Track and manage your reported civic issues</p>
                    </div>
                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <div className="relative">
                            <select
                                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-400 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary sm:w-48"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Issues</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <Link
                            href="/citizen/report"
                            className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-primary hover:shadow-lg focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 active:scale-95 sm:w-auto"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Report New Issue
                        </Link>
                    </div>
                </div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map(stat => (
                        <StatCard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                            accent={stat.accent}
                            iconBg={stat.iconBg}
                            iconColor={stat.iconColor}
                            iconPath={stat.iconPath}
                        />
                    ))}
                </div>

            </div>

            {/* Issues Grid */}
            <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-semibold text-contrast-primary">Recent Issues</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Showing {filteredIssues.length} of {issues.length} issues
                    </div>
                </div>

                <div className="grid gap-6">
                    {filteredIssues.map((issue) => (
                        <IssueCard
                            key={issue._id}
                            issue={issue}
                            onStatusChange={handleStatusChange}
                            onUpvote={fetchIssues}
                            userRole="citizen"
                        />
                    ))}
                </div>
            </div>

            {issues.length === 0 && (
                <Card className="flex flex-col items-center justify-center py-16 text-center mt-8">
                    <div className="bg-brand-soft p-6 rounded-full mb-6">
                        <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-contrast-primary mb-2">No issues reported yet</h3>
                    <p className="text-slate-500 max-w-sm mb-8 text-base">
                        Your dashboard is clear! Help improve your community by reporting any civic concerns you see.
                    </p>
                    <Link
                        href="/citizen/report"
                        className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white bg-brand-primary rounded-xl shadow-md hover:bg-brand-primary hover:shadow-lg transition-all transform active:scale-95"
                    >
                        Report your first issue
                    </Link>
                </Card>
            )}
        </DashboardLayout>
    );
}