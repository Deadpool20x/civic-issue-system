'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalIssues: 0,
        totalUsers: 0,
        departmentStats: {},
        recentIssues: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            // Process department stats
            const departmentStats = data.departmentStats.reduce((acc, dept) => {
                acc[dept._id] = {
                    total: dept.total,
                    resolved: dept.resolved,
                    pending: dept.pending
                };
                return acc;
            }, {});


            setStats({
                totalIssues: data.totalIssues,
                totalUsers: data.totalUsers,
                departmentStats,
                recentIssues: data.recentIssues
            });
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateResolutionRate = () => {
        if (stats.totalIssues === 0) {
            return 0;
        }
        const totalResolved = Object.values(stats.departmentStats).reduce(
            (acc, dept) => acc + dept.resolved,
            0
        );
        return Math.round((totalResolved / stats.totalIssues) * 100);
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
            <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
                        <p className="mt-2 text-3xl font-semibold">{stats.totalIssues}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                        <p className="mt-2 text-3xl font-semibold">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900">Resolution Rate</h3>
                        <p className="mt-2 text-3xl font-semibold">
                            {calculateResolutionRate()}%
                        </p>
                    </div>
                </div>

                {/* Department Performance */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Department Performance
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(stats.departmentStats).map(([dept, data]) => (
                                <div key={dept} className="border-b pb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                                            {dept}
                                        </h4>
                                        <span className="text-sm text-gray-500">
                                            {data.resolved} / {data.total} resolved
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.round(
                                                    (data.resolved / data.total) * 100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Recent Issues
                        </h3>
                        <div className="space-y-4">
                            {stats.recentIssues.map((issue) => (
                                <IssueCard
                                    key={issue._id}
                                    issue={issue}
                                    userRole="admin"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}