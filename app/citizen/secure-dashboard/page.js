'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import IssueCard from '@/components/IssueCard';
import toast from 'react-hot-toast';

export default function SecureCitizenDashboard() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all'
    });

    const fetchIssues = useCallback(async () => {
        try {
            let url = '/api/issues?';
            if (filters.status !== 'all') url += `status=${filters.status}&`;
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
            toast.error('Failed to load your issues');
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
                    <div className="text-lg text-gray-600">Loading your issues...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="space-y-6 pt-0 md:pt-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">🔒 Your Issues Dashboard</h1>
                            <p className="text-sm text-gray-600">View and manage your reported issues with full details</p>
                        </div>
                        <div className="flex space-x-4">
                            <Link
                                href="/citizen/report"
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                📝 Report New Issue
                            </Link>
                            <Link
                                href="/public-dashboard"
                                target="_blank"
                                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                🌐 Public Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    🔒 Your Personal Dashboard
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>This dashboard shows <strong>YOUR ISSUES ONLY</strong> with full details. Other users cannot see your personal information or exact location details.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-gray-900">Your Issues</h3>
                            <p className="mt-2 text-3xl font-semibold">{issues.length}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-yellow-800">Pending</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary.pending || 0}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-blue-800">In Progress</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary['in-progress'] || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4">
                            <h3 className="text-lg font-medium text-green-800">Resolved</h3>
                            <p className="mt-2 text-3xl font-semibold">{statusSummary.resolved || 0}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="reopened">Reopened</option>
                        </select>

                        <select
                            className="border rounded-md px-3 py-2"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Issues Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {issues.map((issue) => (
                            <IssueCard
                                key={issue._id}
                                issue={issue}
                                onStatusChange={handleStatusChange}
                                userRole="citizen"
                                showSensitiveData={true} // Show full details for own issues
                            />
                        ))}
                    </div>

                    {issues.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">You haven't reported any issues yet</div>
                            <Link
                                href="/citizen/report"
                                className="mt-4 inline-block bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium"
                            >
                                Report Your First Issue
                            </Link>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}