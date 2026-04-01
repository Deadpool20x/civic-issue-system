// app/department/issues/page.js
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import { WARD_MAP, getDepartmentWards } from '@/lib/wards'
import toast from 'react-hot-toast'

function IssuesContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const wardFilter = searchParams.get('ward')

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [wardTab, setWardTab] = useState(wardFilter || 'all')

  const deptWards = user?.departmentId
    ? getDepartmentWards(user.departmentId)
    : []
  const northWardId = deptWards[0]
  const southWardId = deptWards[1]

  useEffect(() => {
    if (user?.departmentId) fetchIssues()
  }, [user, statusFilter, wardTab])

  async function fetchIssues() {
    try {
      setLoading(true)
      let url = '/api/issues?'
      if (wardTab && wardTab !== 'all') url += `ward=${wardTab}&`
      if (statusFilter !== 'all') url += `status=${statusFilter}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) setIssues(data.data || [])
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

  const getSLAColor = (deadline) => {
    if (!deadline) return 'text-[#AAAAAA]'
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    if (hours < 0)  return 'text-red-400'
    if (hours < 12) return 'text-amber-400'
    return 'text-green-400'
  }

  const getSLALabel = (deadline) => {
    if (!deadline) return '—'
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    if (hours < 0) return `${Math.abs(Math.round(hours))}h overdue`
    if (hours < 24) return `${Math.round(hours)}h left`
    return `${Math.round(hours / 24)}d left`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Department Issues</h1>
          <p className="text-[#AAAAAA] mt-1">
            All issues across your department
          </p>
        </div>

        {/* Ward tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All Wards' },
            {
              value: northWardId,
              label: `Ward ${WARD_MAP[northWardId]?.wardNumber} — North`
            },
            {
              value: southWardId,
              label: `Ward ${WARD_MAP[southWardId]?.wardNumber} — South`
            },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setWardTab(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${wardTab === tab.value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#1A1A1A] text-[#AAAAAA] border border-[#333]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all',         label: 'All Status' },
            { value: 'pending',     label: 'Pending' },
            { value: 'assigned',    label: 'Assigned' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'resolved',    label: 'Resolved' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition
                ${statusFilter === f.value
                  ? 'bg-[#333] text-white'
                  : 'text-[#666] hover:text-[#AAAAAA]'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Issues list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i}
                className="h-20 bg-[#1A1A1A] rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333]
                          rounded-[20px] p-12 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-[#AAAAAA]">No issues found</p>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#333333]
                          rounded-[20px] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3
                            border-b border-[#333] text-[#666666]
                            text-xs uppercase tracking-wider">
              <span className="col-span-4">Issue</span>
              <span className="col-span-2">Ward</span>
              <span className="col-span-2">Officer</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1">SLA</span>
              <span className="col-span-1">Action</span>
            </div>

            {/* Table rows */}
            {issues.map((issue, i) => (
              <div
                key={issue._id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center
                  ${i < issues.length - 1 ? 'border-b border-[#222]' : ''}
                  hover:bg-[#222] transition`}
              >
                <div className="col-span-4">
                  <span className="text-xs font-mono text-[#F5A623]
                                   bg-[#F5A623]/10 px-2 py-0.5 rounded mr-2">
                    {issue.reportId}
                  </span>
                  <p className="text-white text-sm mt-1 truncate">
                    {issue.title}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#AAAAAA] text-sm">
                    Ward {WARD_MAP[issue.ward]?.wardNumber || '?'}
                    <br />
                    <span className="text-xs text-[#666]">
                      {WARD_MAP[issue.ward]?.zone === 'north'
                        ? 'North' : 'South'}
                    </span>
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#AAAAAA] text-sm">
                    {issue.assignedTo?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs px-2 py-1 rounded-full
                                   font-bold uppercase
                                   ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`text-xs font-medium
                                   ${getSLAColor(issue.sla?.deadline)}`}>
                    {getSLALabel(issue.sla?.deadline)}
                  </span>
                </div>
                <div className="col-span-1">
                  <Link
                    href={`/department/issues/${issue._id}`}
                    className="text-xs text-[#F5A623] hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function DepartmentIssuesPage() {
  return (
    <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER']}>
      <IssuesContent />
    </DashboardProtection>
  )
}
