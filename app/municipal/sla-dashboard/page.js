'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function SLADashboardPage() {
    const [slaData, setSlaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedWard, setSelectedWard] = useState('all');

    const fetchSLAData = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
            if (selectedWard !== 'all') params.append('ward', selectedWard);

            const response = await fetch(`/api/sla?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch SLA data');
            }
            const data = await response.json();
            setSlaData(data);
        } catch (error) {
            toast.error('Failed to load SLA data');
            console.error('Error fetching SLA data:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedDepartment, selectedWard]);

    useEffect(() => {
        fetchSLAData();
    }, [fetchSLAData]);

    const getSLAStatusColor = (hoursRemaining, isOverdue) => {
        if (isOverdue) return 'text-red-600 bg-red-100';
        if (hoursRemaining <= 6) return 'text-orange-600 bg-orange-100';
        if (hoursRemaining <= 24) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading SLA Dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ErrorBoundary>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-slate-900">SLA Dashboard</h1>
                        <div className="flex space-x-4">
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
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
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-700 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[44px]"
                            >
                                <option value="all">All Wards</option>
                                {slaData?.issues?.map(issue => issue.ward).filter((ward, index, self) =>
                                    ward && self.indexOf(ward) === index
                                ).map(ward => (
                                    <option key={ward} value={ward}>{ward}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* SLA Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Total Issues"
                            value={slaData?.summary?.totalIssues || 0}
                            accent="border-l-4 border-l-slate-400"
                            iconBg="bg-slate-100"
                            iconColor="text-slate-600"
                            iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                        <StatCard
                            label="Overdue Issues"
                            value={slaData?.summary?.overdueIssues || 0}
                            accent="border-l-4 border-l-red-400"
                            iconBg="bg-red-50"
                            iconColor="text-red-600"
                            iconPath="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                        <StatCard
                            label="Due Today"
                            value={slaData?.summary?.dueToday || 0}
                            accent="border-l-4 border-l-amber-400"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <StatCard
                            label="SLA Compliance"
                            value={`${slaData?.summary?.slaComplianceRate?.toFixed(1) || 0}%`}
                            accent="border-l-4 border-l-emerald-400"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </div>

                    {/* Department Performance Rankings */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Department Performance Rankings</h3>
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
                                        {slaData?.departmentRankings?.map((dept, index) => (
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
                    </Card>

                    {/* Issues with SLA Status */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Issues with SLA Status</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Remaining</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escalation Level</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upvotes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {slaData?.issues?.map((issue) => (
                                            <tr key={issue._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                                                    <div className="text-sm text-gray-500">{issue.ward}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                                        {issue.assignedDepartment}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                                                        {issue.priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSLAStatusColor(issue.sla.hoursRemaining, issue.sla.isOverdue)}`}>
                                                        {issue.sla.isOverdue ? 'OVERDUE' :
                                                            issue.sla.hoursRemaining <= 6 ? 'CRITICAL' :
                                                                issue.sla.hoursRemaining <= 24 ? 'DUE SOON' : 'ON TRACK'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {issue.sla.isOverdue ?
                                                        `-${Math.abs(issue.sla.hoursRemaining)}h` :
                                                        `${issue.sla.hoursRemaining}h`
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${issue.sla.escalationLevel === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                        issue.sla.escalationLevel === 2 ? 'bg-orange-100 text-orange-800' :
                                                            issue.sla.escalationLevel === 3 ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        Level {issue.sla.escalationLevel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {issue.upvotes}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>
                </div>
            </ErrorBoundary>
        </DashboardLayout>
    );
}
