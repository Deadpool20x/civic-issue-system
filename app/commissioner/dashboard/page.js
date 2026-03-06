'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { useUser } from '@/lib/contexts/UserContext';

import DashboardLayout from '@/components/DashboardLayout';

export default function CommissionerDashboard() {
    const { user } = useUser();
    const [briefing, setBriefing] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        urgent: 0,
        rate: 0
    });
    const [escalations, setEscalations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch briefing
                const briefRes = await fetch('/api/commissioner/briefing');
                if (briefRes.ok) {
                    const data = await briefRes.json();
                    setBriefing(data.briefing);
                }

                // Fetch issues and calculate stats city-wide
                const issuesRes = await fetch('/api/issues');
                if (issuesRes.ok) {
                    const data = await issuesRes.json();
                    const allIssues = data.issues || [];

                    const resolved = allIssues.filter(i => i.status === 'resolved').length;
                    const pending = allIssues.filter(i => ['pending', 'assigned', 'in-progress'].includes(i.status)).length;
                    const urgent = allIssues.filter(i => i.priority === 'urgent' && i.status !== 'resolved').length;

                    setStats({
                        total: allIssues.length,
                        resolved,
                        pending,
                        urgent,
                        rate: allIssues.length > 0 ? Math.round((resolved / allIssues.length) * 100) : 0
                    });

                    setEscalations(allIssues.filter(i => i.status === 'escalated' || i.priority === 'urgent').slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching commissioner data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <PageHeader
                    title="City Panorama"
                    subtitle={`Welcome, Commissioner. Here is your city-wide overview for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.`}
                >
                    <button className="btn-gold">Generate Report</button>
                </PageHeader>

                {/* ── AI BRIEFING CARD ── */}
                {briefing && (
                    <div className="card border-gold/40 bg-gradient-to-br from-card to-gold/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🤖</span>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-0.5 bg-gold text-black text-[10px] font-bold rounded uppercase tracking-wider">AI Insight</span>
                                <span className="text-text-secondary text-xs">{briefing.date}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3">{briefing.title}</h2>
                            <p className="text-text-secondary mb-6 leading-relaxed max-w-2xl">{briefing.summary}</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h3 className="section-header">Key Indicators</h3>
                                    {briefing.keyPoints.map((point, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm text-text-primary">
                                            <span className="text-gold">•</span>
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="section-header">Critical Alerts</h3>
                                    {briefing.criticalAlerts.map((alert, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm text-red-400">
                                            <span>⚠️</span>
                                            <span>{alert}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STATS GRID ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Issues"
                        value={stats.total}
                        icon="📋"
                    />
                    <StatCard
                        label="Resolved"
                        value={stats.resolved}
                        icon="✅"
                        trend={{ value: 12, positive: true }}
                    />
                    <StatCard
                        label="Waitlist"
                        value={stats.pending}
                        icon="⏰"
                    />
                    <StatCard
                        label="Resolution Rate"
                        value={`${stats.rate}%`}
                        icon="📊"
                    />
                </div>

                {/* ── MAIN CONTENT GRID ── */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Department Performance */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <h3 className="section-header mb-6">Department Efficiency</h3>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Active</th>
                                            <th>Resolved</th>
                                            <th>SLA Compliance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-gold/5 transition-colors">
                                            <td className="font-medium">Roads & Infrastructure</td>
                                            <td>{Math.floor(stats.pending * 0.3)}</td>
                                            <td>{Math.floor(stats.resolved * 0.4)}</td>
                                            <td><span className="text-green-400">92%</span></td>
                                        </tr>
                                        <tr className="hover:bg-gold/5 transition-colors">
                                            <td className="font-medium">Waste Management</td>
                                            <td>{Math.floor(stats.pending * 0.4)}</td>
                                            <td>{Math.floor(stats.resolved * 0.3)}</td>
                                            <td><span className="text-amber-400">78%</span></td>
                                        </tr>
                                        <tr className="hover:bg-gold/5 transition-colors">
                                            <td className="font-medium">Water & Drainage</td>
                                            <td>{Math.floor(stats.pending * 0.2)}</td>
                                            <td>{Math.floor(stats.resolved * 0.2)}</td>
                                            <td><span className="text-green-400">88%</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Critical Escalations */}
                    <div className="space-y-6">
                        <div className="card border-red-500/20">
                            <h3 className="section-header text-red-400 mb-6">Critical Escalations</h3>
                            <div className="space-y-4">
                                {escalations.length > 0 ? escalations.map(issue => (
                                    <div key={issue.reportId} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 group cursor-pointer hover:border-red-500/40 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="report-id">{issue.reportId}</span>
                                            <span className="badge-urgent badge">URGENT</span>
                                        </div>
                                        <p className="text-sm font-medium text-white mb-1 group-hover:text-gold transition-colors">{issue.title}</p>
                                        <div className="flex justify-between items-center text-[10px] text-text-muted">
                                            <span>{issue.ward}</span>
                                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-text-muted">No high-priority escalations found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
