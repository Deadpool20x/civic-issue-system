'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import toast from 'react-hot-toast'
import { WARD_MAP, DEPARTMENTS } from '@/lib/wards'

const STATUS_STYLES = {
    'pending': 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    'assigned': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'resolved': 'bg-green-500/20 text-green-400 border-green-500/40',
}

function IssuesContent() {
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })

    // Filters
    const [search, setSearch] = useState('')
    const [wardFilter, setWardFilter] = useState('ALL')
    const [deptFilter, setDeptFilter] = useState('ALL')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [priorityFilter, setPriorityFilter] = useState('ALL')
    const [zoneFilter, setZoneFilter] = useState('ALL')

    useEffect(() => {
        (async () => {
            try {
                // Fetch stats from API
                const statsRes = await fetch('/api/issues/stats')
                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    if (statsData.success && statsData.data) {
                        setStats({
                            total: statsData.data.total || 0,
                            pending: statsData.data.pending || 0,
                            inProgress: statsData.data.inProgress || 0,
                            resolved: statsData.data.resolved || 0
                        })
                    }
                }

                // Fetch issues list
                const res = await fetch('/api/issues')
                if (res.ok) {
                    const data = await res.json()
                    setIssues(data.data || data)
                }
            } catch {
                toast.error('Failed to load data')
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    function getWardDisplay(wardId) {
        const ward = WARD_MAP[wardId]
        if (!ward) return wardId || '—'
        return `Ward ${ward.wardNumber} · ${ward.zone === 'north' ? 'North' : 'South'}`
    }

    function getDeptDisplay(wardId) {
        const ward = WARD_MAP[wardId]
        if (!ward) return '—'
        return DEPARTMENTS[ward.departmentId]?.name || ward.departmentId
    }

    // Client-side filtering
    const filtered = issues.filter(i => {
        let match = true
        if (search) {
            const q = search.toLowerCase()
            const titleMatch = i.title?.toLowerCase().includes(q)
            const idMatch = i.reportId?.toLowerCase().includes(q)
            if (!titleMatch && !idMatch) match = false
        }
        if (wardFilter !== 'ALL' && i.ward !== wardFilter) match = false
        if (deptFilter !== 'ALL') {
            const ward = WARD_MAP[i.ward]
            const deptCode = ward?.departmentId || ''
            if (deptCode !== deptFilter.toLowerCase()) match = false
        }
        if (statusFilter !== 'ALL' && i.status !== statusFilter.toLowerCase()) match = false
        if (priorityFilter !== 'ALL' && i.priority !== priorityFilter.toLowerCase()) match = false
        if (zoneFilter !== 'ALL') {
            const ward = WARD_MAP[i.ward]
            const zone = ward?.zone || ''
            if (zone !== zoneFilter.toLowerCase()) match = false
        }
        return match
    })

    // Summary stats
    const summary = {
        total: issues.length,
        pending: issues.filter(i => i.status === 'pending' || i.status === 'assigned').length,
        inProgress: issues.filter(i => i.status === 'in-progress').length,
        resolved: issues.filter(i => i.status === 'resolved').length
    }

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">All Issues</h1>
                        <p className="text-text-secondary text-sm mt-1">Global view of all civic issues</p>
                    </div>
                </div>

                {/* Read-Only Banner */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[12px] px-4 py-3 mb-6 flex items-center gap-2">
                    <span className="text-amber-400">👁️</span>
                    <p className="text-amber-400 text-sm">
                        Viewing in Read-Only Mode — System Admin cannot modify issue data
                    </p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-white' },
                        { label: 'Pending', value: stats.pending, color: 'text-blue-400' },
                        { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400' },
                        { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-center">
                            <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                            <div className="text-xs text-text-muted uppercase tracking-wider font-bold">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input type="text" placeholder="Search ID or Title..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold" />
                    </div>

                    <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold">
                        <option value="ALL">All Zones</option>
                        <option value="north">North Zone</option>
                        <option value="south">South Zone</option>
                    </select>

                    <select value={wardFilter} onChange={e => setWardFilter(e.target.value)} className="bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold">
                        <option value="ALL">All Wards</option>
                        {Array.from({ length: 16 }, (_, i) => <option key={i + 1} value={`ward-${i + 1}`}>Ward {i + 1}</option>)}
                    </select>

                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold">
                        <option value="ALL">All Depts</option>
                        {['roads', 'lighting', 'waste', 'water', 'parks', 'traffic', 'health', 'other'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold whitespace-nowrap">
                        <option value="ALL">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>

                    <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-[#111] border border-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-gold whitespace-nowrap">
                        <option value="ALL">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {/* Issues Table */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#111] border-b border-border">
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Report ID</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Title</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Ward</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Department</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Priority</th>
                                    <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-text-muted whitespace-nowrap">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-12 text-text-muted">No issues match filters.</td></tr>
                                ) : filtered.map(i => (
                                    <tr key={i._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4"><span className="text-xs font-mono font-bold text-gold bg-gold/10 px-2 py-1 rounded">{i.reportId || '—'}</span></td>
                                        <td className="px-4 py-4 text-white font-medium max-w-[250px] truncate" title={i.title}>{i.title}</td>
                                        <td className="px-4 py-4">{getWardDisplay(i.ward)}</td>
                                        <td className="px-4 py-4">{getDeptDisplay(i.ward)}</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[i.status] || ''}`}>
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${i.priority === 'urgent' ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                                                i.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                                                    i.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                                                        'bg-zinc-500/20 text-zinc-400 border-zinc-500/40'
                                                }`}>
                                                {i.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-text-muted text-sm whitespace-nowrap">
                                            {new Date(i.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default function AdminIssuesPage() {
    return (
        <DashboardProtection allowedRoles={['SYSTEM_ADMIN', 'admin', 'MUNICIPAL_COMMISSIONER', 'commissioner']}>
            <IssuesContent />
        </DashboardProtection>
    )
}
