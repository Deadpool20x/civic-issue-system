// app/admin/issues/[id]/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import { WARD_MAP, DEPARTMENTS } from '@/lib/wards'
import toast from 'react-hot-toast'

function IssueDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/issues/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setIssue(data.data)
        else router.push('/admin/dashboard')
      })
      .catch(() => router.push('/admin/dashboard'))
      .finally(() => setLoading(false))
  }, [params.id])

  const getStatusColor = (status) => {
    const colors = {
      'pending':     'bg-gray-500/20 text-gray-400',
      'assigned':    'bg-blue-500/20 text-blue-400',
      'in-progress': 'bg-amber-500/20 text-amber-400',
      'resolved':    'bg-green-500/20 text-green-400',
    }
    return colors[status] || colors.pending
  }

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-white/10 rounded-xl" />
        <div className="h-48 bg-white/5 rounded-[20px]" />
      </div>
    </DashboardLayout>
  )

  if (!issue) return null

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-[#AAAAAA] hover:text-white transition flex items-center gap-2">
          ← Back to Dashboard
        </button>

        {/* Read Only Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30
                        rounded-[12px] px-4 py-3 flex items-center gap-2">
          <span className="text-amber-400">👁️</span>
          <p className="text-amber-400 text-sm">
            Read-Only View — System Admin cannot modify issues
          </p>
        </div>

        {/* Issue Details */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-[20px] p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-[#F5A623]
                             bg-[#F5A623]/10 px-2 py-1 rounded">
              {issue.reportId}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
                             ${getStatusColor(issue.status)}`}>
              {issue.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{issue.title}</h1>
          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-4">
            {issue.description}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#AAAAAA]">Ward</span>
              <p className="text-white">
                Ward {WARD_MAP[issue.ward]?.wardNumber} —
                {WARD_MAP[issue.ward]?.zone === 'north' ? ' North' : ' South'}
              </p>
            </div>
            <div>
              <span className="text-[#AAAAAA]">Department</span>
              <p className="text-white">
                {DEPARTMENTS[WARD_MAP[issue.ward]?.departmentId]?.name || '—'}
              </p>
            </div>
            <div>
              <span className="text-[#AAAAAA]">Priority</span>
              <p className="text-white capitalize">{issue.priority}</p>
            </div>
            <div>
              <span className="text-[#AAAAAA]">Reported</span>
              <p className="text-white">
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminIssueDetailPage() {
  return (
    <DashboardProtection allowedRoles={['SYSTEM_ADMIN']}>
      <IssueDetailContent />
    </DashboardProtection>
  )
}
