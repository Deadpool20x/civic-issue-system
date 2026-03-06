'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

/* PAGE 26: Public Dashboard (Dark Theme) */

function timeAgo(date) {
    const h = Math.floor((Date.now() - new Date(date)) / 3600000);
    if (h < 1) return 'just now'; if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
}

export default function PublicDashboardPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [w, setW] = useState('all');
    const [d, setD] = useState('all');

    useEffect(() => {
        (async () => {
            try {
                const params = new URLSearchParams();
                if (w !== 'all') params.append('ward', w);
                if (d !== 'all') params.append('department', d);
                const res = await fetch(`/api/public-dashboard?${params}`);
                if (res.ok) setData(await res.json());
            } catch (e) { console.error('Error fetching public dash:', e); }
            finally { setLoading(false); }
        })();
    }, [w, d]);

    if (loading) return (
        <div className="min-h-screen bg-page text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                <span className="text-sm text-text-secondary">Loading public data...</span>
            </div>
        </div>
    );

    const inputCls = "bg-input border border-border rounded-input text-white focus:border-gold focus:outline-none px-4 py-2.5 text-sm";

    return (
        <div className="min-h-screen bg-page text-white">
            {/* Header */}
            <header className="bg-card border-b border-border shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between h-16 items-center gap-4">
                        <Link href="/" className="text-xl font-bold font-heading text-white hover:text-gold transition-colors">
                            Civic Issue System
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-text-secondary hover:text-white px-3 py-2 text-sm font-medium transition-colors">Login</Link>
                            <Link href="/register" className="btn-gold px-4 py-2 text-sm">Report Issue</Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-heading mb-2">Public Dashboard</h1>
                    <p className="text-text-secondary">Real-time transparency into city-wide civic issues</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 border border-border rounded-card">
                    <select value={w} onChange={e => setW(e.target.value)} className={inputCls + " flex-1"}>
                        <option value="all">All Wards</option>
                        {data?.wardStats?.map(w => <option key={w.ward} value={w.ward}>{w.ward}</option>)}
                    </select>
                    <select value={d} onChange={e => setD(e.target.value)} className={inputCls + " flex-1"}>
                        <option value="all">All Departments</option>
                        <option value="water">Water</option><option value="electricity">Electricity</option>
                        <option value="roads">Roads</option><option value="garbage">Garbage</option>
                        <option value="parks">Parks</option><option value="other">Other</option>
                    </select>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">📊</span>
                        <div className="stat-value">{data?.summary?.totalIssues || 0}</div>
                        <div className="stat-label">Total Issues</div>
                    </div>
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">✅</span>
                        <div className="stat-value text-green-400">{data?.summary?.resolvedIssues || 0}</div>
                        <div className="stat-label">Resolved</div>
                    </div>
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">⏳</span>
                        <div className="stat-value text-amber-400">{data?.summary?.pendingIssues || 0}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card">
                        <span className="text-xl mb-2 block">📈</span>
                        <div className="stat-value text-gold">{data?.summary?.slaComplianceRate?.toFixed(1) || 0}%</div>
                        <div className="stat-label">SLA Compliance</div>
                    </div>
                </div>

                {/* Dept Rankings & Top Issues Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Dept Leaderboard */}
                    <div className="bg-card rounded-card border border-border h-full flex flex-col">
                        <div className="p-5 border-b border-border">
                            <h2 className="section-header mb-0">Department Performance</h2>
                        </div>
                        <div className="p-5 flex-1 space-y-6">
                            {data?.departmentRankings?.map((d, i) => (
                                <div key={d.department} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-background text-text-muted border border-border'}`}>
                                                #{i + 1}
                                            </span>
                                            <span className="font-semibold text-white capitalize">{d.department}</span>
                                        </div>
                                        <div className="text-text-secondary text-xs">
                                            {d.slaComplianceRate.toFixed(0)}% SLA • {d.totalIssuesResolved} res.
                                        </div>
                                    </div>
                                    <div className="w-full bg-border rounded-full h-1.5 flex items-center">
                                        <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${d.performanceScore}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-text-muted uppercase tracking-widest px-8">
                                        <span>Score: {d.performanceScore.toFixed(1)}</span>
                                        <span>Avg res: {d.averageResolutionTime.toFixed(1)}h</span>
                                    </div>
                                </div>
                            ))}
                            {(!data?.departmentRankings || data.departmentRankings.length === 0) && (
                                <div className="text-center py-12 text-text-secondary">No department data</div>
                            )}
                        </div>
                    </div>

                    {/* Upvoted Issues */}
                    <div className="bg-card rounded-card border border-border h-full flex flex-col">
                        <div className="p-5 border-b border-border">
                            <h2 className="section-header mb-0">Most Upvoted Issues</h2>
                        </div>
                        <div className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                            {data?.mostUpvotedIssues?.length === 0 ? (
                                <div className="text-center py-12 text-text-secondary">No trending issues</div>
                            ) : data?.mostUpvotedIssues?.map((i) => (
                                <div key={i._id} className="p-5 border-b border-border hover:bg-white/5 transition-colors flex gap-4 items-start">
                                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg p-3 text-center min-w-[60px]">
                                        <div className="text-xl leading-none font-bold mb-1">👍</div>
                                        <div className="text-xs font-bold">{i.upvotes}</div>
                                    </div>
                                    <div className="flex-1">
                                        <a href={`/issues/${i.reportId || i._id}`} className="text-white font-medium hover:text-gold block mb-1">
                                            {i.title}
                                        </a>
                                        <p className="text-xs text-text-muted mb-3 uppercase tracking-wider">
                                            {i.department} • {i.ward} • {timeAgo(i.createdAt)}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-[2px] rounded-full text-[10px] font-bold uppercase border border-border bg-background text-text-secondary">{i.status}</span>
                                            <span className="px-2 py-[2px] rounded-full text-[10px] font-bold uppercase border border-border bg-background text-text-secondary">{i.priority}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ward Performance */}
                <div className="bg-card rounded-card border border-border overflow-hidden">
                    <div className="p-5 border-b border-border">
                        <h2 className="section-header mb-0">Ward-wise Overview</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table-dark w-full">
                            <thead><tr><th>Ward</th><th>Total Issues</th><th>Resolved</th><th>Resolution Rate</th><th>Upvotes</th></tr></thead>
                            <tbody>
                                {data?.wardStats?.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-text-secondary">No ward data</td></tr>
                                ) : data?.wardStats?.map(w => (
                                    <tr key={w.ward}>
                                        <td className="text-white font-medium">{w.ward}</td>
                                        <td>{w.totalIssues}</td>
                                        <td>{w.resolvedIssues}</td>
                                        <td><span className="text-gold font-medium">{w.resolutionRate?.toFixed(1) || 0}%</span></td>
                                        <td><span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-pill text-xs font-bold">{w.upvotes}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-text-muted mt-8 pb-12">
                    <p>Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Now'}</p>
                    <p className="mt-1">Providing transparency in civic issue resolution. Data is updated in real-time.</p>
                </div>
            </div>
        </div>
    );
}
