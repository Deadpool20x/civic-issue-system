// app/commissioner/issues/page.js
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/UserContext'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import { WARD_MAP, DEPARTMENTS } from '@/lib/wards'
import toast from 'react-hot-toast'

function IssuesContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const deptFilter = searchParams.get('dept')

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [wardFilter, setWardFilter] = useState('all')
  const [deptTab, setDeptTab] = useState(deptFilter || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')

  useEffect(() => { fetchIssues() }, [wardFilter, deptTab, statusFilter, zoneFilter])

  async function fetchIssues() {
    try {
      setLoading(true)
      let url = '/api/issues?'
      if (wardFilter !== 'all') url += `ward=${wardFilter}&`
      if (statusFilter !== 'all') url += `status=${statusFilter}&`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        let filtered = data.data || []
        // Filter by department
        if (deptTab !== 'all') {
          filtered = filtered.filter(i =>
            WARD_MAP[i.ward]?.departmentId === deptTab
          )
        }
        // Filter by zone
        if (zoneFilter !== 'all') {
          filtered = filtered.filter(i =>
            WARD_MAP[i.ward]?.zone === zoneFilter
          )
        }
        setIssues(filtered)
      }
    } catch {
      toast.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending':     'bg-gray-500/20 text-gray-400',
      'assigned':    'bg-blue-500/20 text-blue-400',
      'in-progress': 'bg-amber-500/20 text-amber-400',
      'resolved':    'bg-green-500/20 text-green-400',
      'escalated':   'bg-red-500/20 text-red-400',
    }
    return colors[status] || colors.pending
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">City Issues</h1>
          <p className="text-[#AAAAAA] mt-1">
            All issues across Anand District
          </p>
        </div>

        {/* Zone filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all',   label: 'All Zones' },
            { value: 'north', label: '🔵 North Zone' },
            { value: 'south', label: '🟣 South Zone' },
          ].map(f => (
            <button key={f.value}
              onClick={() => setZoneFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${zoneFilter === f.value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#1A1A1A] text-[#AAAAAA] border border-[#333]'
                }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Department filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDeptTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition
              ${deptTab === 'all'
                ? 'bg-[#333] text-white'
                : 'text-[#666] hover:text-[#AAAAAA]'
              }`}>
            All Departments
          </button>
          {Object.values(DEPARTMENTS).map(dept => (
            <button key={dept.id}
              onClick={() => setDeptTab(dept.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition
                ${deptTab === dept.id
                  ? 'bg-[#333] text-white'
                  : 'text-[#666] hover:text-[#AAAAAA]'
                }`}>
              {dept.icon} {dept.name}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {['all','pending','assigned','in-progress','resolved','escalated'].map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs transition
                ${statusFilter === s
                  ? 'bg-[#444] text-white'
                  : 'text-[#555] hover:text-[#AAAAAA]'
                }`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>

        {/* Read Only Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30
                        rounded-[12px] px-4 py-3 flex items-center gap-2">
          <span className="text-amber-400">👁️</span>
          <p className="text-amber-400 text-sm">
            Viewing in Read-Only Mode —
            Use the Reassign button to transfer issues between departments
          </p>
        </div>

        {/* Issues count */}
        <p className="text-[#AAAAAA] text-sm">
          {loading ? 'Loading...' : `${issues.length} issues found`}
        </p>

        {/* Issues table */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i}
                className="h-16 bg-[#1A1A1A] rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333]
                          rounded-[20px] p-12 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-[#AAAAAA]">No issues found</p>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#333]
                          rounded-[20px] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3
                            border-b border-[#333] text-[#666]
                            text-xs uppercase tracking-wider">
              <span className="col-span-4">Issue</span>
              <span className="col-span-2">Ward</span>
              <span className="col-span-2">Department</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Priority</span>
            </div>
            {issues.map((issue, i) => (
              <div key={issue._id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                  ${i < issues.length - 1 ? 'border-b border-[#222]' : ''}
                  hover:bg-[#222] transition`}>
                <div className="col-span-4">
                  <span className="text-xs font-mono text-[#F5A623]
                                   bg-[#F5A623]/10 px-2 py-0.5 rounded mr-2">
                    {issue.reportId}
                  </span>
                  <p className="text-white text-sm mt-1 truncate">
                    {issue.title}
                  </p>
                </div>
                <div className="col-span-2 text-[#AAAAAA] text-sm">
                  Ward {WARD_MAP[issue.ward]?.wardNumber || '?'}
                  <br />
                  <span className="text-xs text-[#666]">
                    {WARD_MAP[issue.ward]?.zone === 'north'
                      ? 'North' : 'South'}
                  </span>
                </div>
                <div className="col-span-2 text-[#AAAAAA] text-sm">
                  {DEPARTMENTS[WARD_MAP[issue.ward]?.departmentId]?.name || '—'}
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full
                                   font-bold uppercase
                                   ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <div className="col-span-2 text-[#AAAAAA] text-sm capitalize">
                  {issue.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function CommissionerIssuesPage() {
  return (
    <DashboardProtection allowedRoles={['MUNICIPAL_COMMISSIONER']}>
      <IssuesContent />
    </DashboardProtection>
  )
}
