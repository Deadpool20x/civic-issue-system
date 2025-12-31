'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import PrivacyNotice from '@/components/PrivacyNotice';
import SpotlightCard from '@/components/ui/SpotlightCard';
import StarBorderButton from '@/components/ui/StarBorderButton';
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
            accent: 'from-yellow-500/15 via-yellow-400/5 to-transparent border-yellow-300/70 text-yellow-900',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 9 0 0118 0z'
        },
        {
            label: 'In Progress',
            value: issues.filter(i => i.status === 'in-progress').length,
            accent: 'from-blue-500/15 via-blue-400/5 to-transparent border-blue-300/70 text-blue-900',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            iconPath: 'M13 10V3L4 14h7v7l9-11h-7z'
        },
        {
            label: 'Resolved',
            value: issues.filter(i => i.status === 'resolved').length,
            accent: 'from-emerald-500/15 via-emerald-400/5 to-transparent border-emerald-300/70 text-emerald-900',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 9 0 0118 0z'
        },
        {
            label: 'Total Issues',
            value: issues.length,
            accent: 'from-slate-500/15 via-slate-400/5 to-transparent border-slate-300/70 text-slate-900',
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
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
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Privacy Notice */}
                <PrivacyNotice userRole={user?.role} showDetails={true} />

                {/* Header Section */}
                <SpotlightCard className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold">My Issues</h1>
                            <p className="text-blue-100">Track and manage your reported civic issues</p>
                        </div>
                        <div className="flex flex-1 flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-end">
                            <select
                                className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none transition focus:border-white/60 focus:ring-2 focus:ring-white/70 md:w-auto"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all" className="text-gray-900">All Issues</option>
                                <option value="pending" className="text-gray-900">Pending</option>
                                <option value="in-progress" className="text-gray-900">In Progress</option>
                                <option value="resolved" className="text-gray-900">Resolved</option>
                                <option value="rejected" className="text-gray-900">Rejected</option>
                            </select>
                            <StarBorderButton
                                as={Link}
                                href="/citizen/report"
                                color="rgba(255,255,255,0.9)"
                                className="text-sm font-semibold text-indigo-900"
                                thickness={0}
                            >
                                Report New Issue
                            </StarBorderButton>
                        </div>
                    </div>
                </SpotlightCard>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map(stat => (
                        <SpotlightCard
                            key={stat.label}
                            className={`relative border ${stat.accent} bg-white/95 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                        >
                            <div className="flex items-center">
                                <div className={`rounded-2xl p-2 ${stat.iconBg}`}>
                                    <svg className={`h-6 w-6 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>



            </div>

            {/* Issues Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Issues</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Showing {filteredIssues.length} of {issues.length} issues
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <SpotlightCard className="flex flex-col items-center gap-6 border border-dashed border-indigo-300 bg-white/95 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                        <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">No issues reported yet</h3>
                        <p className="mx-auto max-w-md text-gray-600">
                            You haven't reported any issues yet. Help improve your community by reporting civic issues.
                        </p>
                    </div>
                    <StarBorderButton
                        as={Link}
                        href="/citizen/report"
                        className="text-sm font-semibold text-indigo-50"
                        color="rgba(99,102,241,0.85)"
                        thickness={0}
                    >
                        Report an Issue
                    </StarBorderButton>
                </SpotlightCard>
            )}
        </DashboardLayout>
    );
}