'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import ErrorBoundary from '@/components/ErrorBoundary';
import PrivacyNotice from '@/components/PrivacyNotice';
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
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="space-y-6 pt-0 md:pt-0">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
                            <p className="mt-2 text-3xl font-semibold text-gray-800">{issues.length}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
                            <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                            <p className="mt-2 text-3xl font-semibold text-yellow-900">{statusSummary.pending || 0}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
                            <h3 className="text-lg font-medium text-blue-800">In Progress</h3>
                            <p className="mt-2 text-3xl font-semibold text-blue-900">{statusSummary['in-progress'] || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
                            <h3 className="text-lg font-medium text-green-800">Resolved</h3>
                            <p className="mt-2 text-3xl font-semibold text-green-900">{statusSummary.resolved || 0}</p>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <PrivacyNotice userRole={user?.role} showDetails={true} />

                    {/* Quick Actions */}
                    <div className="flex space-x-4">
                        <Link
                            href="/admin/secure-dashboard"
                            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            🔒 Secure Admin View
                        </Link>
                        <Link
                            href="/municipal/sla-dashboard"
                            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            📊 SLA Dashboard
                        </Link>
                        <Link
                            href="/municipal/departments"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            🏢 Manage Departments
                        </Link>
                        <Link
                            href="/public-dashboard"
                            target="_blank"
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                            🌐 Public Dashboard
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow border border-gray-200">
                        <select
                            className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Issues Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
                            <p className="mt-2 text-gray-500">
                                No issues match your current filters.
                            </p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}