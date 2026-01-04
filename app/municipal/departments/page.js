'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Card from '@/components/ui/Card';
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
                    <div className="text-lg text-slate-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="max-w-7xl mx-auto px-4 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-slate-900">Department Management</h1>
                    </div>

                    {/* Department Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(departmentStats).map(([deptType, data]) => (
                            <Card key={deptType} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 capitalize">
                                            {deptType} Department
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {data.department?.name || 'Department'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {data.staffCount}
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Staff</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {data.issueCount}
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Issues</div>
                                    </div>
                                </div>

                                {data.issues.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Activity</h4>
                                        <div className="space-y-2">
                                            {data.issues.slice(0, 3).map((issue) => (
                                                <div key={issue._id} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600 truncate max-w-[60%]">{issue.title}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        issue.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        issue.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                        issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {issue.status}
                                                    </span>
                                                </div>
                                            ))}
                                            {data.issues.length > 3 && (
                                                <div className="text-xs text-indigo-600 font-medium mt-2">
                                                    +{data.issues.length - 3} more issues
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>

                    {/* All Issues by Department */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900">
                                All Issues by Department
                            </h3>
                        </div>

                        {issues.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No issues found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Department
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Priority
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Reporter
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {issues.map((issue) => (
                                            <tr key={issue._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {issue.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 capitalize">
                                                        {issue.assignedDepartment}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        issue.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                        issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                        issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {issue.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        issue.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                        issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                        {issue.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500">
                                                        {issue.reportedBy?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}