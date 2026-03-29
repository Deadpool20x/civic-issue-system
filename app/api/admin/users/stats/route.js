import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import User from '@/models/User'

export async function GET(request) {
  const user = await getUser(request)
  if (!['SYSTEM_ADMIN', 'admin', 'MUNICIPAL_COMMISSIONER', 'COMMISSIONER'].includes(user?.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  try {
    // Get counts for each role type
    const [total, citizens, officers, managers, commissioners, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['CITIZEN', 'citizen'] } }),
      User.countDocuments({ role: 'FIELD_OFFICER' }),
      User.countDocuments({ role: { $in: ['DEPARTMENT_MANAGER', 'department'] } }),
      User.countDocuments({ role: { $in: ['MUNICIPAL_COMMISSIONER', 'municipal', 'COMMISSIONER'] } }),
      User.countDocuments({ role: { $in: ['SYSTEM_ADMIN', 'admin'] } })
    ])

    return Response.json({
      success: true,
      data: {
        total,
        citizens,
        officers,
        managers,
        commissioners,
        admins
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
