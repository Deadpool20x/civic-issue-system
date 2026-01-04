'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import IssueCard from '@/components/IssueCard';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
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
                    <div className="text-lg text-slate-600">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total Issues"
                        value={stats.totalIssues}
                        accent="border-l-4 border-l-slate-400"
                        iconBg="bg-slate-100"
                        iconColor="text-slate-600"
                        iconPath="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        accent="border-l-4 border-l-slate-400"
                        iconBg="bg-slate-100"
                        iconColor="text-slate-600"
                        iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                    <StatCard
                        label="Resolution Rate"
                        value={`${calculateResolutionRate()}%`}
                        accent="border-l-4 border-l-slate-400"
                        iconBg="bg-slate-100"
                        iconColor="text-slate-600"
                        iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </div>

                {/* Department Performance */}
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">
                            Department Performance
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {Object.entries(stats.departmentStats).map(([dept, data]) => (
                            <div key={dept} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <h4 className="font-semibold text-slate-900 capitalize">
                                        {dept}
                                    </h4>
                                    <span className="text-slate-500">
                                        {data.resolved} / {data.total} resolved
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
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
                </Card>

                {/* Recent Issues */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">
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
        </DashboardLayout>
    );
}