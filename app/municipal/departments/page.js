'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import toast from 'react-hot-toast';

export default function MunicipalDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            // Fetch departments
            const deptResponse = await fetch('/api/departments');
            if (!deptResponse.ok) {
                throw new Error('Failed to fetch departments');
            }
            const deptData = await deptResponse.json();
            setDepartments(deptData);

            // Fetch issues
            const issuesResponse = await fetch('/api/issues');
            if (!issuesResponse.ok) {
                throw new Error('Failed to fetch issues');
            }
            const issuesData = await issuesResponse.json();
            setIssues(issuesData);
        } catch (error) {
            toast.error('Failed to load data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getDepartmentStats = () => {
        const stats = {};
        const departmentTypes = ['water', 'electricity', 'roads', 'garbage', 'parks', 'other'];

        departmentTypes.forEach(type => {
            // Map department types to actual department names
            const deptName = type === 'water' ? 'Public Works' :
                type === 'electricity' ? 'Public Works' :
                    type === 'roads' ? 'Public Works' :
                        type === 'garbage' ? 'Environmental Services' :
                            type === 'parks' ? 'Parks and Recreation' :
                                'Other Department';

            const dept = departments.find(d => d.name === deptName);
            const deptIssues = issues.filter(issue => issue.assignedDepartment === type);

            stats[type] = {
                department: dept,
                issues: deptIssues,
                staffCount: dept?.staffCount || 0,
                issueCount: deptIssues.length
            };
        });

        return stats;
    };

    const departmentStats = getDepartmentStats();

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
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Department Management</h1>
                    </div>

                    {/* Department Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(departmentStats).map(([deptType, data]) => (
                            <div key={deptType} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                                            {deptType} Department
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {data.department?.name || 'Department'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {data.staffCount}
                                        </div>
                                        <div className="text-xs text-gray-500">Staff Members</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {data.issueCount}
                                        </div>
                                        <div className="text-xs text-gray-500">Active Issues</div>
                                    </div>
                                </div>

                                {data.issues.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Issues:</h4>
                                        <div className="space-y-1">
                                            {data.issues.slice(0, 3).map((issue) => (
                                                <div key={issue._id} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600 truncate">{issue.title}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                                issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                    'bg-red-100 text-red-800'
                                                        }`}>
                                                        {issue.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            ))}
                                            {data.issues.length > 3 && (
                                                <div className="text-xs text-gray-500">
                                                    +{data.issues.length - 3} more issues
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* All Issues by Department */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                All Issues by Department
                            </h3>

                            {issues.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No issues found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Department
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Priority
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Reporter
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {issues.map((issue) => (
                                                <tr key={issue._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {issue.title}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                            {issue.assignedDepartment}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                                    issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'
                                                            }`}>
                                                            {issue.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                                issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'
                                                            }`}>
                                                            {issue.priority.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {issue.reportedBy?.name || 'Unknown'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}