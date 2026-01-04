'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivacyNotice from '@/components/PrivacyNotice';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { useUser } from '@/lib/contexts/UserContext';
import toast from 'react-hot-toast';

export default function MunicipalDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        department: 'all',
        priority: 'all'
    });
    const searchParams = useSearchParams();
    const { user } = useUser();

    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            setFilters(prev => ({ ...prev, status: filterParam }));
        }
    }, [searchParams]);

    const fetchIssues = useCallback(async () => {
        try {
            let url = '/api/issues?';
            if (filters.status !== 'all') url += `status=${filters.status}&`;
            if (filters.department !== 'all') url += `department=${filters.department}&`;
            if (filters.priority !== 'all') url += `priority=${filters.priority}`;

            const response = await fetch(url, {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch issues');
            }
            const data = await response.json();
            setIssues(data);
        } catch (error) {
            toast.error('Failed to load issues');
            console.error('Error fetching issues:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

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
                credentials: 'include',
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

    const getStatusSummary = () => {
        return issues.reduce((acc, issue) => {
            acc[issue.status] = (acc[issue.status] || 0) + 1;
            return acc;
        }, {});
    };

    const statusSummary = getStatusSummary();

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
            <ErrorBoundary>
                <div className="max-w-7xl mx-auto space-y-6 pt-0 md:pt-0">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Issues"
                            value={issues.length}
                            accent="border-l-4 border-l-slate-400"
                            iconBg="bg-slate-100"
                            iconColor="text-slate-600"
                            iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                        <StatCard
                            label="Pending"
                            value={statusSummary.pending || 0}
                            accent="border-l-4 border-l-amber-400"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 0 9 0 0118 0z"
                        />
                        <StatCard
                            label="In Progress"
                            value={statusSummary['in-progress'] || 0}
                            accent="border-l-4 border-l-blue-400"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                        <StatCard
                            label="Resolved"
                            value={statusSummary.resolved || 0}
                            accent="border-l-4 border-l-emerald-400"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </div>

                    {/* Privacy Notice */}
                    <PrivacyNotice userRole={user?.role} showDetails={true} />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/admin/secure-dashboard"
                            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                        >
                            🔒 Secure Admin View
                        </Link>
                        <Link
                            href="/municipal/sla-dashboard"
                            className="bg-red-600 text-white hover:bg-red-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                        >
                            📊 SLA Dashboard
                        </Link>
                        <Link
                            href="/municipal/departments"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                        >
                            🏢 Manage Departments
                        </Link>
                        <Link
                            href="/public-dashboard"
                            target="_blank"
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                        >
                            🌐 Public Dashboard
                        </Link>
                    </div>

                    {/* Filters */}
                    <Card className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <select
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            value={filters.department}
                            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        >
                            <option value="all">All Departments</option>
                            <option value="water">Water</option>
                            <option value="electricity">Electricity</option>
                            <option value="roads">Roads</option>
                            <option value="garbage">Garbage</option>
                            <option value="parks">Parks</option>
                            <option value="other">Other</option>
                        </select>

                        <select
                            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </Card>

                    {/* Issues Grid */}
                    <div className="grid gap-6">
                        {issues.map((issue) => (
                            <IssueCard
                                key={issue._id}
                                issue={issue}
                                onStatusChange={handleStatusChange}
                                userRole="municipal"
                            />
                        ))}
                    </div>

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-slate-900">No issues found</h3>
                            <p className="mt-2 text-slate-500">
                                No issues match your current filters.
                            </p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}