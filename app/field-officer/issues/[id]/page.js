// app/field-officer/issues/[id]/page.js
'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@/lib/contexts/UserContext'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import DashboardProtection from '@/components/DashboardProtection'
import ImageUploader from '@/components/ImageUploader'
import toast from 'react-hot-toast'

function IssueDetailContent() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const issueId = params.id

  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)

  // Proof upload state
  const [showProofForm, setShowProofForm] = useState(false)
  const [proofNote, setProofNote] = useState('')
  const [proofImages, setProofImages] = useState([])
  const [uploadingProof, setUploadingProof] = useState(false)

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (issueId) fetchIssue()
  }, [issueId])

  async function fetchIssue() {
    try {
      setLoading(true)
      const res = await fetch(`/api/issues/${issueId}`)
      const data = await res.json()
      // Because we kept the existing GET route which returns {issue: {}, stateHistory: []}
      // Or if it returns {success: true, data: {}} we handle both.
      if (data.success && data.data) {
        setIssue(data.data)
      } else if (data.issue) {
        setIssue(data.issue)
      } else {
        toast.error('Issue not found')
        router.push('/field-officer/issues')
      }
    } catch {
      toast.error('Failed to load issue')
      router.push('/field-officer/issues')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      setUpdatingStatus(true)
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update status')
        return
      }
      toast.success(`Status updated to ${newStatus}`)
      fetchIssue() // Refresh issue data
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleProofUpload() {
    if (!proofNote || proofNote.trim().length < 10) {
      toast.error('Please write a resolution note (min 10 characters)')
      return
    }
    try {
      setUploadingProof(true)
      const res = await fetch(`/api/issues/${issueId}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: proofNote,
          images: proofImages,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload proof')
        return
      }
      toast.success('Proof uploaded! You can now mark as resolved.')
      setShowProofForm(false)
      fetchIssue() // Refresh
    } catch {
      toast.error('Failed to upload proof')
    } finally {
      setUploadingProof(false)
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

  const getSLAInfo = (deadline) => {
    if (!deadline) return { label: 'No deadline', color: 'text-[#AAAAAA]' }
    const hours = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    if (hours < 0)
      return { label: `Overdue by ${Math.abs(Math.round(hours))} hours`, color: 'text-red-400' }
    if (hours < 2)
      return { label: `${Math.round(hours * 60)} minutes remaining`, color: 'text-red-400' }
    if (hours < 24)
      return { label: `${Math.round(hours)} hours remaining`, color: 'text-amber-400' }
    return { label: `${Math.round(hours / 24)} days remaining`, color: 'text-green-400' }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-xl" />
          <div className="h-48 bg-white/5 rounded-[20px]" />
          <div className="h-32 bg-white/5 rounded-[20px]" />
        </div>
      </DashboardLayout>
    )
  }

  if (!issue) return null

  const slaInfo = getSLAInfo(issue.sla?.deadline)
  const hasProof = issue.resolutionProof?.note
  const canMarkInProgress = ['assigned', 'pending'].includes(issue.status)
  const canMarkResolved = issue.status === 'in-progress' && hasProof

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back button */}
        <button
          onClick={() => router.push('/field-officer/issues')}
          className="text-[#AAAAAA] hover:text-white transition flex items-center gap-2"
        >
          ← Back to Issues
        </button>

        {/* Issue Header */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                {issue.title}
              </h1>
              <p className="text-[#AAAAAA] text-sm">
                Reported on {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-[#CCCCCC] text-sm leading-relaxed mb-4">
            {issue.description}
          </p>

          {/* SLA */}
          <div className={`text-sm font-medium ${slaInfo.color}`}>
            ⏱️ SLA: {slaInfo.label}
          </div>
        </div>

        {/* Citizen Contact */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
          <h3 className="text-white font-bold mb-3">Citizen Contact</h3>
          {issue.reportedBy ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#AAAAAA] text-sm w-16">Name:</span>
                <span className="text-white text-sm">
                  {issue.reportedBy.name || 'Not available'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#AAAAAA] text-sm w-16">Email:</span>
                <span className="text-white text-sm">
                  {issue.reportedBy.email || 'Not available'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#AAAAAA] text-sm w-16">Phone:</span>
                <span className="text-white text-sm">
                  {issue.reportedBy.phone || 'Not provided'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[#AAAAAA] text-sm">Contact info not available</p>
          )}
        </div>

        {/* Location */}
        {issue.location && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
            <h3 className="text-white font-bold mb-3">Location</h3>
            <p className="text-[#CCCCCC] text-sm">
              {issue.location.address || 'Address not provided'}
            </p>
            {issue.location.coordinates?.coordinates && (
              <a
                href={`https://maps.google.com/?q=${issue.location.coordinates.coordinates[1]},${issue.location.coordinates.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F5A623] text-sm hover:underline mt-2 block"
              >
                📍 Open in Google Maps →
              </a>
            )}
          </div>
        )}

        {/* Issue Photos */}
        {issue.images && issue.images.length > 0 && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-[20px] p-6">
            <h3 className="text-white font-bold mb-3">
              Reported Photos ({issue.images.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {issue.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Issue photo ${i + 1}`}
                  className="w-full h-40 object-cover rounded-[12px]"
                />
              ))}
            </div>
          </div>
        )}

        {/* Resolution Proof (if uploaded) */}
        {hasProof && (
          <div className="bg-green-500/10 border border-green-500/30
                          rounded-[20px] p-6">
            <h3 className="text-green-400 font-bold mb-3">
              ✅ Resolution Proof Uploaded
            </h3>
            <p className="text-[#CCCCCC] text-sm mb-3">
              {issue.resolutionProof.note}
            </p>
            {issue.resolutionProof.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {issue.resolutionProof.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`Proof ${i + 1}`}
                    className="w-full h-36 object-cover rounded-[12px]"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proof Upload Form */}
        {showProofForm && !hasProof && (
          <div className="bg-[#1A1A1A] border border-[#F5A623]/30
                          rounded-[20px] p-6">
            <h3 className="text-white font-bold mb-4">Upload Resolution Proof</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[#AAAAAA] text-sm block mb-2">
                  Resolution Note (required — describe what was done)
                </label>
                <textarea
                  value={proofNote}
                  onChange={e => setProofNote(e.target.value)}
                  rows={4}
                  placeholder="Describe exactly what work was done to fix this issue..."
                  className="w-full bg-[#222222] border border-[#333333]
                             rounded-[12px] px-4 py-3 text-white
                             placeholder:text-[#666666] resize-y
                             focus:border-[#F5A623] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#AAAAAA] text-sm block mb-2">
                  Before/After Photos (recommended)
                </label>
                <ImageUploader
                  onImagesChange={setProofImages}
                  maxImages={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProofForm(false)}
                  className="flex-1 py-3 rounded-full border border-[#333]
                             text-[#AAAAAA] hover:border-white
                             hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProofUpload}
                  disabled={uploadingProof}
                  className="flex-[2] py-3 rounded-full bg-[#F5A623]
                             text-black font-bold hover:bg-[#E09010]
                             transition disabled:opacity-50"
                >
                  {uploadingProof ? 'Uploading...' : 'Upload Proof'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {issue.status !== 'resolved' && (
          <div className="bg-[#1A1A1A] border border-[#333333]
                          rounded-[20px] p-6">
            <h3 className="text-white font-bold mb-4">Actions</h3>
            <div className="space-y-3">

              {/* Start Work button */}
              {canMarkInProgress && (
                <button
                  onClick={() => handleStatusUpdate('in-progress')}
                  disabled={updatingStatus}
                  className="w-full py-3 rounded-full bg-amber-500/20
                             border border-amber-500/30 text-amber-400
                             font-bold hover:bg-amber-500/30 transition
                             disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : '🔄 Start Work (Mark In-Progress)'}
                </button>
              )}

              {/* Upload Proof button */}
              {issue.status === 'in-progress' && !hasProof && !showProofForm && (
                <button
                  onClick={() => setShowProofForm(true)}
                  className="w-full py-3 rounded-full bg-blue-500/20
                             border border-blue-500/30 text-blue-400
                             font-bold hover:bg-blue-500/30 transition"
                >
                  📸 Upload Resolution Proof
                </button>
              )}

              {/* Mark Resolved button */}
              {canMarkResolved && (
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={updatingStatus}
                  className="w-full py-3 rounded-full bg-[#F5A623]
                             text-black font-bold hover:bg-[#E09010]
                             transition disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : '✅ Mark as Resolved'}
                </button>
              )}

              {/* Info if proof needed */}
              {issue.status === 'in-progress' && !hasProof && (
                <p className="text-[#666666] text-xs text-center">
                  Upload proof before marking as resolved
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resolved message */}
        {issue.status === 'resolved' && (
          <div className="bg-green-500/10 border border-green-500/30
                          rounded-[20px] p-6 text-center">
            <span className="text-4xl block mb-2">✅</span>
            <h3 className="text-green-400 font-bold text-lg">
              Issue Resolved
            </h3>
            <p className="text-[#AAAAAA] text-sm mt-1">
              This issue has been marked as resolved.
              The citizen will be notified to confirm.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function FieldOfficerIssueDetailPage() {
  return (
    <DashboardProtection allowedRoles={['FIELD_OFFICER']}>
      <IssueDetailContent />
    </DashboardProtection>
  )
}
