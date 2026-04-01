// app/api/issues/[id]/priority/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import Issue from '@/models/Issue'
import { getDepartmentWards } from '@/lib/wards'

export const dynamic = 'force-dynamic'

export async function PATCH(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user || user.role !== 'DEPARTMENT_MANAGER') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid body' }, { status: 400 })
    }

    const { priority } = body
    if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return Response.json({ error: 'Invalid priority' }, { status: 400 })
    }

    await connectDB()
    const issue = await Issue.findById(id)
    if (!issue) {
      return Response.json({ error: 'Issue not found' }, { status: 404 })
    }

    const deptWards = getDepartmentWards(user.departmentId)
    if (!deptWards.includes(issue.ward)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    issue.priority = priority
    issue.updatedAt = new Date()

    if (issue.statusHistory) {
      issue.statusHistory.push({
        status: issue.status,
        changedBy: user.userId,
        changedAt: new Date(),
        note: `Priority changed to ${priority.toUpperCase()}`
      })
    }

    await issue.save()

    return Response.json({ success: true, data: issue })
  } catch (error) {
    console.error('Update priority error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
