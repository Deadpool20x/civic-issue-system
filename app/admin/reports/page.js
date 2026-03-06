'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE F4: Admin — Reports & Export */

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400', 'in-progress': 'bg-amber-500/20 text-amber-400',
    'resolved': 'bg-green-500/20 text-green-400', 'rejected': 'bg-red-500/20 text-red-400',
};

function ReportsContent() {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/reports');
                if (res.ok) setReports(await res.json());
            } catch { toast.error('Failed to load reports'); }
            finally { setLoading(false); }
        })();
    }, []);

    const downloadReport = async (format) => {
        try {
            const res = await fetch(`/api/reports/download?format=${format}`);
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `report.${format}`; a.click();
            URL.revokeObjectURL(url); toast.success(`${format.toUpperCase()} downloaded`);
        } catch { toast.error('Download failed'); }
    };

    if (loading) return (
        <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div></DashboardLayout>
    );

    const summary = reports?.summary || {};
    const issues = reports?.issues || [];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reports & Export</h1>
                        <p className="text-text-secondary text-sm mt-1">Generate and download system reports</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => downloadReport('csv')} className="btn-outline px-4 py-2 text-sm">📄 CSV</button>
                        <button onClick={() => downloadReport('json')} className="btn-outline px-4 py-2 text-sm">📋 JSON</button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {[
                        { label: 'Total', value: summary.total || issues.length, icon: '📊' },
                        { label: 'Pending', value: summary.pending || 0, icon: '⏳' },
                        { label: 'Resolved', value: summary.resolved || 0, icon: '✅' },
                        { label: 'Rejected', value: summary.rejected || 0, icon: '❌' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <span className="text-xl mb-2 block">{s.icon}</span>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Issues */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="section-header mb-0">Recent Issues</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Department</th><th>Date</th></tr></thead>
                            <tbody>
                                {issues.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-text-secondary">No data</td></tr>
                                ) : issues.slice(0, 25).map(i => (
                                    <tr key={i._id}>
                                        <td><span className="report-id">{i.reportId || '—'}</span></td>
                                        <td className="max-w-[200px] truncate text-white">{i.title}</td>
                                        <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[i.status] || ''}`}>{i.status}</span></td>
                                        <td className="capitalize text-text-secondary text-xs">{i.assignedDepartment || '—'}</td>
                                        <td className="text-text-muted text-xs">{new Date(i.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function AdminReports() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin']}>
            <ReportsContent />
        </DashboardProtection>
    );
}