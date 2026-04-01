// app/api/issues/[id]/status/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import Issue from '@/models/Issue'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only field officers can update status via this route
    if (user.role !== 'FIELD_OFFICER') {
      return Response.json(
        { error: 'Only Field Officers can update issue status' },
        { status: 403 }
      )
    }

    const { id } = params
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { status, note } = body

    // Valid status transitions for field officer
    const validStatuses = ['in-progress', 'resolved']
    if (!status || !validStatuses.includes(status)) {
      return Response.json(
        { error: 'Status must be "in-progress" or "resolved"' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find issue — must belong to this officer's ward
    const issue = await Issue.findById(id)

    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Verify this officer is responsible for this ward
    if (issue.ward !== user.wardId) {
      return Response.json(
        { error: 'You can only update issues in your ward' },
        { status: 403 }
      )
    }

    // Cannot update already resolved issues
    if (issue.status === 'resolved') {
      return Response.json(
        { error: 'Issue is already resolved' },
        { status: 400 }
      )
    }

    // If marking resolved — proof must have been uploaded first
    // Check if resolution proof exists on the issue
    if (status === 'resolved') {
      if (!issue.resolutionProof ||
          !issue.resolutionProof.note ||
          issue.resolutionProof.note.trim().length === 0) {
        return Response.json(
          { error: 'Please upload resolution proof before marking as resolved. Use the Upload Proof button first.' },
          { status: 400 }
        )
      }
    }

    // Update status
    const previousStatus = issue.status
    issue.status = status
    issue.updatedAt = new Date()

    // Add to status history if it exists
    if (issue.statusHistory) {
      issue.statusHistory.push({
        status,
        changedBy: user.userId,
        changedAt: new Date(),
        note: note || `Status updated to ${status}`
      })
    }

    // Set resolution time if resolved
    if (status === 'resolved') {
      const timeDiff = new Date() - issue.createdAt
      issue.resolutionTime = Math.ceil(timeDiff / (1000 * 60 * 60))
    }

    await issue.save()

    return Response.json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: {
        _id: issue._id,
        reportId: issue.reportId,
        status: issue.status,
        previousStatus,
        updatedAt: issue.updatedAt
      }
    })

  } catch (error) {
    console.error('Status update error:', error)
    return Response.json(
      { error: 'Failed to update status. Please try again.' },
      { status: 500 }
    )
  }
}
