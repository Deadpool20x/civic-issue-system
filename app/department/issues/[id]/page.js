// app/department/issues/[id]/page.js
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/contexts/UserContext'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import { WARD_MAP, getDepartmentWards } from '@/lib/wards'
import toast from 'react-hot-toast'

function IssueDetailContent() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useUser()

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [officers, setOfficers] = useState({ north: null, south: null })
  const [reassigning, setReassigning] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)

  const deptWards = user?.departmentId
    ? getDepartmentWards(user.departmentId)
    : []
  const northWardId = deptWards[0]
  const southWardId = deptWards[1]

  useEffect(() => {
    if (id && user?.departmentId) {
      fetchIssue()
      fetchOfficers()
    }
  }, [id, user])

  async function fetchIssue() {
    try {
      setLoading(true)
      const res = await fetch(`/api/issues/${id}`)
      const data = await res.json()
      if (data.success) {
        setIssue(data.data)
      } else {
        toast.error('Failed to load issue')
        router.push('/department/issues')
      }
    } catch {
      toast.error('Failed to load issue')
      router.push('/department/issues')
    } finally {
      setLoading(false)
    }
  }

  async function fetchOfficers() {
    try {
      const [northRes, southRes] = await Promise.all([
        fetch(`/api/admin/users?role=FIELD_OFFICER&wardId=${northWardId}`),
        fetch(`/api/admin/users?role=FIELD_OFFICER&wardId=${southWardId}`)
      ])
      const [northData, southData] = await Promise.all([
        northRes.json(),
        southRes.json()
      ])
      setOfficers({
        north: northData.data?.[0] || null,
        south: southData.data?.[0] || null
      })
    } catch (err) {
      console.error('Failed to fetch officers:', err)
    }
  }

  async function handleReassign(newOfficerId) {
    try {
      setReassigning(true)
      const res = await fetch(`/api/issues/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: newOfficerId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Issue reassigned')
      setShowReassignModal(false)
      fetchIssue()
    } catch (err) {
      toast.error(err.message || 'Failed to reassign')
    } finally {
      setReassigning(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!issue) return null

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-[#AAAAAA] hover:text-white mb-4 text-sm
                         flex items-center transition"
            >
              ← Back to Issues
            </button>
            <h1 className="text-2xl font-bold text-white mb-2">
              {issue.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-mono text-[#F5A623]
                               bg-[#F5A623]/10 px-3 py-1 rounded-full">
                {issue.reportId}
              </span>
              <span className="text-sm px-3 py-1 bg-white/5 rounded-full
                               text-white">
                Ward {WARD_MAP[issue.ward]?.wardNumber}
              </span>
              <span className={`text-sm px-3 py-1 rounded-full font-bold uppercase
                ${issue.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  issue.status === 'escalated' ? 'bg-red-500/20 text-red-400' :
                  issue.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'}`}>
                {issue.status}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowReassignModal(true)}
              className="bg-[#1A1A1A] border border-[#333] hover:border-white
                         px-4 py-2 rounded-full text-sm font-medium transition
                         text-white"
            >
              Reassign Issue
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#1A1A1A] border border-[#333] rounded-[20px] p-6">
              <h3 className="text-white font-bold mb-4">Description</h3>
              <p className="text-[#AAAAAA] whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>

              {issue.imageUrl && (
                <div className="mt-6">
                  <h3 className="text-white font-bold mb-4">Initial Photo</h3>
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className="w-full h-auto rounded-xl border border-[#333]"
                  />
                </div>
              )}
            </div>

            {/* AI Analysis / Workflow Info */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-[20px] p-6">
              <h3 className="text-white font-bold mb-4">Status History</h3>
              <div className="space-y-4">
                {(issue.statusHistory || []).map((history, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#F5A623]"></div>
                      {i < issue.statusHistory.length - 1 && (
                        <div className="w-[1px] h-full bg-[#333] mx-auto mt-1"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        <span className="uppercase font-bold text-xs mr-2">
                          {history.status}
                        </span>
                        {history.note || `Status updated to ${history.status}`}
                      </p>
                      <p className="text-[#666] text-xs">
                        {new Date(history.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {(!issue.statusHistory || issue.statusHistory.length === 0) && (
                  <p className="text-[#AAAAAA] text-sm italic">
                    No status history available.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1A1A1A] border border-[#333] rounded-[20px] p-6">
              <h3 className="text-white font-bold mb-4">Assignment</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[#666] text-xs uppercase mb-1">Ward</p>
                  <p className="text-white text-sm">
                    Ward {WARD_MAP[issue.ward]?.wardNumber}
                    <span className="text-[#AAAAAA] ml-1">
                      ({WARD_MAP[issue.ward]?.zone} zone)
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-[#666] text-xs uppercase mb-1">
                    Assigned Officer
                  </p>
                  {issue.assignedTo ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <p className="text-white text-sm">{issue.assignedTo.name}</p>
                        <p className="text-[#AAAAAA] text-xs uppercase">{issue.assignedTo.role}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#F5A623] text-sm">Unassigned</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333] rounded-[20px] p-6">
              <h3 className="text-white font-bold mb-4">SLA Deadline</h3>
              {issue.sla?.deadline ? (
                <>
                  <p className={`text-2xl font-bold mb-1
                    ${new Date(issue.sla.deadline) < new Date() ? 'text-red-400' : 'text-[#F5A623]'}`}>
                    {new Date(issue.sla.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-[#AAAAAA] text-sm">
                    {new Date(issue.sla.deadline).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p className="text-[#AAAAAA]">No SLA set</p>
              )}
            </div>
          </div>
        </div>

        {/* Reassign Modal */}
        {showReassignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center
                          bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A1A] border border-[#333333]
                            rounded-[20px] p-6 w-full max-w-md">
              <h3 className="text-white font-bold text-lg mb-2">
                Reassign Issue
              </h3>
              <p className="text-[#AAAAAA] text-sm mb-6">
                {issue.reportId} — {issue.title}
              </p>

              <div className="space-y-3 mb-6">
                <p className="text-[#AAAAAA] text-xs uppercase tracking-wider">
                  Select Officer to Reassign To:
                </p>

                {/* North Zone Officer */}
                <button
                  onClick={() => officers.north && handleReassign(officers.north._id)}
                  disabled={!officers.north || reassigning}
                  className={`w-full p-4 rounded-xl border text-left transition
                    ${officers.north
                      ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                      : 'bg-[#222] border-[#333] opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-xs font-bold uppercase mb-1">
                        North Zone
                      </p>
                      <p className="text-white font-medium">
                        {officers.north?.name || 'No officer assigned'}
                      </p>
                      <p className="text-[#AAAAAA] text-xs">
                        Ward {WARD_MAP[northWardId]?.wardNumber}
                      </p>
                    </div>
                    {issue.ward === northWardId && (
                      <span className="text-xs text-[#AAAAAA] bg-[#333]
                                       px-2 py-1 rounded">Current</span>
                    )}
                  </div>
                </button>

                {/* South Zone Officer */}
                <button
                  onClick={() => officers.south && handleReassign(officers.south._id)}
                  disabled={!officers.south || reassigning}
                  className={`w-full p-4 rounded-xl border text-left transition
                    ${officers.south
                      ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                      : 'bg-[#222] border-[#333] opacity-50 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-400 text-xs font-bold uppercase mb-1">
                        South Zone
                      </p>
                      <p className="text-white font-medium">
                        {officers.south?.name || 'No officer assigned'}
                      </p>
                      <p className="text-[#AAAAAA] text-xs">
                        Ward {WARD_MAP[southWardId]?.wardNumber}
                      </p>
                    </div>
                    {issue.ward === southWardId && (
                      <span className="text-xs text-[#AAAAAA] bg-[#333]
                                       px-2 py-1 rounded">Current</span>
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowReassignModal(false)}
                className="w-full py-3 rounded-full border border-[#333]
                           text-[#AAAAAA] hover:border-white hover:text-white
                           transition"
                disabled={reassigning}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function DepartmentIssueDetailPage() {
  return (
    <DashboardProtection allowedRoles={['DEPARTMENT_MANAGER']}>
      <IssueDetailContent />
    </DashboardProtection>
  )
}
