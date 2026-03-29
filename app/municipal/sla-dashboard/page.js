'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardProtection from '@/components/DashboardProtection';
import toast from 'react-hot-toast';

/* PAGE D2: SLA Dashboard (Dept Manager) */

const SLA_COLORS = {
    overdue: 'bg-red-500/20 text-red-400 border border-red-500/40',
    critical: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    dueSoon: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    onTrack: 'bg-green-500/20 text-green-400 border border-green-500/40',
};

const PRIORITY_STYLES = {
    'urgent': 'bg-red-500/20 text-red-400 border border-red-500/40',
    'high': 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
    'medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    'low': 'bg-green-500/20 text-green-400 border border-green-500/40',
};

function getSlaTag(hoursRemaining, isOverdue) {
    if (isOverdue) return { label: 'OVERDUE', cls: SLA_COLORS.overdue };
    if (hoursRemaining <= 6) return { label: 'CRITICAL', cls: SLA_COLORS.critical };
    if (hoursRemaining <= 24) return { label: 'DUE SOON', cls: SLA_COLORS.dueSoon };
    return { label: 'ON TRACK', cls: SLA_COLORS.onTrack };
}

function SLAContent() {
    const [slaData, setSlaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dept, setDept] = useState('all');
    const [ward, setWard] = useState('all');
    const inputCls = "bg-input border border-border rounded-input text-white px-4 py-2.5 focus:border-gold focus:outline-none text-sm";

    const fetchSLA = useCallback(async () => {
        try {
            const p = new URLSearchParams();
            if (dept !== 'all') p.append('department', dept);
            if (ward !== 'all') p.append('ward', ward);
            const res = await fetch(`/api/sla?${p}`);
            if (!res.ok) throw new Error('Failed');
            setSlaData(await res.json());
        } catch { toast.error('Failed to load SLA data'); }
        finally { setLoading(false); }
    }, [dept, ward]);

    useEffect(() => { fetchSLA(); }, [fetchSLA]);

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        </DashboardLayout>
    );

    const summary = slaData?.summary || {};
    const stats = [
        { label: 'Total', value: summary.totalIssues || 0, icon: '📊' },
        { label: 'Overdue', value: summary.overdueIssues || 0, icon: '🔴' },
        { label: 'Due Today', value: summary.dueToday || 0, icon: '⏳' },
        { label: 'SLA Rate', value: `${(summary.slaComplianceRate || 0).toFixed(1)}%`, icon: '✅' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">SLA Dashboard</h1>
                        <p className="text-text-secondary text-sm mt-1">Service Level Agreement compliance tracking</p>
                    </div>
                    <div className="flex gap-3">
                        <select value={dept} onChange={e => setDept(e.target.value)} className={inputCls}>
                            <option value="all">All Departments</option>
                            <option value="water">Water</option>
                            <option value="electricity">Electricity</option>
                            <option value="roads">Roads</option>
                            <option value="garbage">Garbage</option>
                            <option value="parks">Parks</option>
                        </select>
                        <select value={ward} onChange={e => setWard(e.target.value)} className={inputCls}>
                            <option value="all">All Wards</option>
                            {Array.isArray(slaData?.issues) && slaData.issues.map(i => i.ward).filter((w, i, a) => w && a.indexOf(w) === i).map(w => (
                                <option key={w} value={w}>{w}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    {stats.map(s => (
                        <div key={s.label} className="stat-card">
                            <span className="text-xl mb-2 block">{s.icon}</span>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Dept Rankings */}
                {slaData?.departmentRankings?.length > 0 && (
                    <div className="bg-card rounded-card border border-border overflow-hidden">
                        <div className="p-4 border-b border-border">
                            <h2 className="section-header mb-0">Department Rankings</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-dark w-full">
                                <thead><tr><th>#</th><th>Department</th><th>Score</th><th>SLA %</th><th>Resolved</th><th>Avg Time</th></tr></thead>
                                <tbody>
                                    {slaData.departmentRankings.map((d, i) => (
                                        <tr key={d.department}>
                                            <td><span className={`text-xs font-bold ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>#{i + 1}</span></td>
                                            <td className="capitalize">{d.department}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-border rounded-full h-1.5">
                                                        <div className="bg-gold h-1.5 rounded-full" style={{ width: `${d.performanceScore}%` }} />
                                                    </div>
                                                    <span className="text-xs text-text-muted">{d.performanceScore.toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td>{d.slaComplianceRate.toFixed(1)}%</td>
                                            <td>{d.totalIssuesResolved}</td>
                                            <td>{d.averageResolutionTime.toFixed(1)}h</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SLA Issues Table */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="section-header mb-0">Issues by SLA Status</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>Title</th><th>Department</th><th>Priority</th><th>SLA</th><th>Hours</th><th>Escalation</th><th>Upvotes</th></tr></thead>
                            <tbody>
                                {(!slaData?.issues || slaData.issues.length === 0) ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-text-secondary">No issues found</td></tr>
                                ) : Array.isArray(slaData?.issues) && slaData.issues.map(issue => {
                                    const tag = getSlaTag(issue.sla?.hoursRemaining, issue.sla?.isOverdue);
                                    return (
                                        <tr key={issue._id}>
                                            <td>
                                                <div className="text-white text-sm">{issue.title}</div>
                                                <div className="text-text-muted text-xs">{issue.ward}</div>
                                            </td>
                                            <td className="capitalize text-text-secondary text-xs">{issue.assignedDepartment}</td>
                                            <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || ''}`}>{issue.priority}</span></td>
                                            <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tag.cls}`}>{tag.label}</span></td>
                                            <td className="text-xs">{issue.sla?.isOverdue ? <span className="text-red-400">-{Math.abs(issue.sla.hoursRemaining)}h</span> : <span className="text-text-muted">{issue.sla?.hoursRemaining}h</span>}</td>
                                            <td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${issue.sla?.escalationLevel >= 3 ? SLA_COLORS.overdue : issue.sla?.escalationLevel >= 2 ? SLA_COLORS.critical : SLA_COLORS.dueSoon}`}>L{issue.sla?.escalationLevel || 0}</span></td>
                                            <td className="text-text-muted text-xs">👍 {issue.upvotes}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function SLADashboardPage() {
    return (
        <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER', 'municipal', 'MUNICIPAL_COMMISSIONER', 'commissioner']}>
            <SLAContent />
        </DashboardProtection>
    );
}
