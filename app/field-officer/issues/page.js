// app/field-officer/issues/page.js
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import toast from 'react-hot-toast'

function IssuesContent() {
  const { user } = useUser()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    if (!user?.wardId) return
    fetchIssues()
  }, [user, filter])

  async function fetchIssues() {
    try {
      setLoading(true)
      const statusParam = filter === 'active'
        ? 'status=pending&status=assigned&status=in-progress'
        : filter === 'resolved'
        ? 'status=resolved'
        : ''
      const res = await fetch(`/api/issues?ward=${user.wardId}`)
      const data = await res.json()
      if (data.success) {
        const filtered = filter === 'active'
          ? data.data.filter(i =>
              ['pending','assigned','in-progress'].includes(i.status))
          : filter === 'resolved'
          ? data.data.filter(i => i.status === 'resolved')
          : data.data
        setIssues(filtered)
      }
    } catch (err) {
      toast.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending':     'bg-gray-500/20 text-gray-400 border-gray-500/40',
      'assigned':    'bg-blue-500/20 text-blue-400 border-blue-500/40',
      'in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      'resolved':    'bg-green-500/20 text-green-400 border-green-500/40',
    }
    return colors[status] || colors.pending
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'bg-red-500/20 text-red-400',
      'high':   'bg-orange-500/20 text-orange-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'low':    'bg-green-500/20 text-green-400',
    }
    return colors[priority] || colors.medium
  }

  const getSLAColor = (deadline) => {
    if (!deadline) return 'text-[#AAAAAA]'
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    if (hours < 0)  return 'text-red-400'
    if (hours < 2)  return 'text-red-400'
    if (hours < 12) return 'text-amber-400'
    return 'text-green-400'
  }

  const getSLALabel = (deadline) => {
    if (!deadline) return 'No deadline'
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    if (hours < 0)
      return `⚫ Overdue by ${Math.abs(Math.round(hours))}h`
    if (hours < 2)
      return `🔴 ${Math.round(hours * 60)}min left`
    if (hours < 24)
      return `🟡 ${Math.round(hours)}h left`
    return `🟢 ${Math.round(hours / 24)}d left`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Issues</h1>
            <p className="text-[#AAAAAA] mt-1">
              Ward {user?.wardId?.replace('ward-','')} — All assigned issues
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { value: 'active',   label: 'Active' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'all',      label: 'All' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${filter === f.value
                  ? 'bg-[#F5A623] text-black'
                  : 'bg-[#1A1A1A] text-[#AAAAAA] border border-[#333]'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Issues list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i}
                className="h-24 bg-[#1A1A1A] rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333]
                          rounded-[20px] p-12 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-[#AAAAAA]">No issues found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map(issue => (
              <Link
                key={issue._id}
                href={`/field-officer/issues/${issue._id}`}
                className="block bg-[#1A1A1A] border border-[#333333]
                           hover:border-[#F5A623]/50 rounded-[20px] p-5
                           transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono font-bold
                                       text-[#F5A623] bg-[#F5A623]/10
                                       px-2 py-1 rounded">
                        {issue.reportId}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full
                                       border font-bold uppercase
                                       ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full
                                       font-bold uppercase
                                       ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>
                    <h4 className="text-white font-medium mb-1">
                      {issue.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#AAAAAA]">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                      <span className={getSLAColor(issue.sla?.deadline)}>
                        {getSLALabel(issue.sla?.deadline)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[#AAAAAA] text-lg ml-3">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function FieldOfficerIssuesPage() {
  return (
    <DashboardProtection allowedRoles={['FIELD_OFFICER']}>
      <IssuesContent />
    </DashboardProtection>
  )
}
