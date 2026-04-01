// app/api/issues/[id]/assign/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import { getDepartmentWards } from '@/lib/wards'
import Issue from '@/models/Issue'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only department managers can reassign
    if (user.role !== 'DEPARTMENT_MANAGER') {
      return Response.json(
        { error: 'Only Department Managers can reassign issues' },
        { status: 403 }
      )
    }

    if (!user.departmentId) {
      return Response.json(
        { error: 'Department not assigned to your account' },
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

    const { officerId } = body
    if (!officerId) {
      return Response.json(
        { error: 'officerId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the issue
    const issue = await Issue.findById(id)
    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Verify issue belongs to this manager's department
    const deptWards = getDepartmentWards(user.departmentId)
    if (!deptWards.includes(issue.ward)) {
      return Response.json(
        { error: 'You can only reassign issues in your department' },
        { status: 403 }
      )
    }

    // Find the new officer
    const newOfficer = await User.findById(officerId)
    if (!newOfficer || newOfficer.role !== 'FIELD_OFFICER') {
      return Response.json(
        { error: 'Invalid officer selected' },
        { status: 400 }
      )
    }

    // Officer must be in one of the manager's wards
    if (!deptWards.includes(newOfficer.wardId)) {
      return Response.json(
        { error: 'Officer does not belong to your department' },
        { status: 403 }
      )
    }

    const previousOfficerId = issue.assignedTo
    const previousWard = issue.ward

    // Update issue assignment
    issue.assignedTo = newOfficer._id
    issue.ward = newOfficer.wardId // Update ward to match new officer's ward
    issue.status = 'assigned'
    issue.updatedAt = new Date()

    // Add to status history
    if (issue.statusHistory) {
      issue.statusHistory.push({
        status: 'assigned',
        changedBy: user.userId,
        changedAt: new Date(),
        note: `Reassigned by Department Manager to ${newOfficer.name}`
      })
    }

    await issue.save()

    return Response.json({
      success: true,
      message: `Issue reassigned to ${newOfficer.name}`,
      data: {
        _id: issue._id,
        reportId: issue.reportId,
        assignedTo: newOfficer.name,
        ward: issue.ward,
        status: issue.status
      }
    })

  } catch (error) {
    console.error('Reassign error:', error)
    return Response.json(
      { error: 'Failed to reassign issue. Please try again.' },
      { status: 500 }
    )
  }
}
