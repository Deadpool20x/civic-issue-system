import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import { getRoleFilter } from '@/lib/roleFilter'
import { WARD_MAP, getDepartmentWards } from '@/lib/wards'
import Issue from '@/models/Issue'
import User from '@/models/User'

export async function GET(request) {
  const user = await getUser(request)
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const filter = getRoleFilter(user)
  if (filter === null) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const specificWard = searchParams.get('wardId')

  await connectDB()

  // Determine which wards to get stats for
  let visibleWards = []

  if (filter.ward && typeof filter.ward === 'string') {
    visibleWards = [filter.ward]
  } else if (filter.ward?.$in) {
    visibleWards = filter.ward.$in
  } else if (Object.keys(filter).length === 0) {
    visibleWards = Object.keys(WARD_MAP)
  } else {
    return Response.json({ success: true, data: [] })
  }

  // Apply specific ward filter if requested (and allowed)
  if (specificWard && visibleWards.includes(specificWard)) {
    visibleWards = [specificWard]
  }

  const wardStats = await Promise.all(
    visibleWards.map(async (wardId) => {
      const [total, resolved, overdue, pending, inProgress] =
        await Promise.all([
          Issue.countDocuments({ ward: wardId }),
          Issue.countDocuments({ ward: wardId, status: 'resolved' }),
          Issue.countDocuments({ ward: wardId, 'sla.isOverdue': true }),
          Issue.countDocuments({ ward: wardId, status: 'pending' }),
          Issue.countDocuments({ ward: wardId, status: 'in-progress' }),
        ])

      const slaHealth = total > 0
        ? Math.round(((total - overdue) / total) * 100)
        : 0

      const officer = await User.findOne({
        role: 'FIELD_OFFICER',
        wardId,
        isActive: true
      }).select('name email').lean()

      return {
        wardId,
        wardNumber: WARD_MAP[wardId]?.wardNumber,
        zone: WARD_MAP[wardId]?.zone,
        departmentId: WARD_MAP[wardId]?.departmentId,
        total,
        resolved,
        overdue,
        pending,
        inProgress,
        active: total - resolved,
        slaHealth,
        officer: officer || null
      }
    })
  )

  return Response.json({ success: true, data: wardStats })
}
