'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicDashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedWard, setSelectedWard] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const params = new URLSearchParams();
                if (selectedWard !== 'all') params.append('ward', selectedWard);
                if (selectedDepartment !== 'all') params.append('department', selectedDepartment);

                const response = await fetch(`/api/public-dashboard?${params}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedWard, selectedDepartment]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading public dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between h-16 gap-4">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Civic Issue System - Public Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-gray-700 hover:text-gray-900 px-3 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-md text-sm font-medium min-h-[44px] flex items-center justify-center"
                            >
                                Report Issue
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 space-x-4">
                    <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    >
                        <option value="all">All Wards</option>
                        {dashboardData?.wardStats?.map(ward => (
                            <option key={ward.ward} value={ward.ward}>{ward.ward}</option>
                        ))}
                    </select>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                    >
                        <option value="all">All Departments</option>
                        <option value="water">Water</option>
                        <option value="electricity">Electricity</option>
                        <option value="roads">Roads</option>
                        <option value="garbage">Garbage</option>
                        <option value="parks">Parks</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                                <p className="text-2xl font-semibold text-gray-900">{dashboardData?.summary?.totalIssues || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                                <p className="text-2xl font-semibold text-green-600">{dashboardData?.summary?.resolvedIssues || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                                <p className="text-2xl font-semibold text-yellow-600">{dashboardData?.summary?.pendingIssues || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                                <p className="text-2xl font-semibold text-purple-600">{dashboardData?.summary?.slaComplianceRate?.toFixed(1) || 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department Performance Leaderboard */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance Leaderboard</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Compliance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues Resolved</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Resolution Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData?.departmentRankings?.map((dept, index) => (
                                        <tr key={dept.department}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-gray-50 text-gray-600'
                                                    }`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                {dept.department}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${dept.performanceScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600">{dept.performanceScore.toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {dept.slaComplianceRate.toFixed(1)}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {dept.totalIssuesResolved}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {dept.averageResolutionTime.toFixed(1)}h
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Most Upvoted Issues */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Upvoted Issues</h3>
                        <div className="space-y-4">
                            {dashboardData?.mostUpvotedIssues?.map((issue, index) => (
                                <div key={issue._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900">{issue.title}</h4>
                                        <p className="text-sm text-gray-500">
                                            {issue.department} • {issue.ward} • {new Date(issue.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                            issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {issue.priority.toUpperCase()}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                            issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {issue.status.toUpperCase()}
                                        </span>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                            </svg>
                                            {issue.upvotes}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ward-wise Performance */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ward-wise Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issues</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upvotes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dashboardData?.wardStats?.map((ward) => (
                                        <tr key={ward.ward}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {ward.ward}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {ward.totalIssues}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {ward.resolvedIssues}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {ward.resolutionRate?.toFixed(1) || 0}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {ward.upvotes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Last updated: {new Date(dashboardData?.lastUpdated).toLocaleString()}</p>
                    <p className="mt-2">
                        This dashboard provides transparency in civic issue resolution.
                        Data is updated every 5 minutes.
                    </p>
                </div>
            </div>
        </div>
    );
}
