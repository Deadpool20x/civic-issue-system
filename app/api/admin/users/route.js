import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import User from '@/models/User'

export async function GET(request) {
  const user = await getUser(request)
  if (!['SYSTEM_ADMIN','admin'].includes(user?.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  const { searchParams } = new URL(request.url)
  const role         = searchParams.get('role')
  const wardId       = searchParams.get('wardId')
  const departmentId = searchParams.get('departmentId')
  const status       = searchParams.get('status')
  const search       = searchParams.get('search')

  const query = {}

  if (role && role !== 'active' && role !== 'inactive') {
    const roleMap = {
      'CITIZEN': { $in: ['CITIZEN','citizen'] },
      'FIELD_OFFICER': 'FIELD_OFFICER',
      'DEPARTMENT_MANAGER': { $in: ['DEPARTMENT_MANAGER','department'] },
      'MUNICIPAL_COMMISSIONER': { $in: ['MUNICIPAL_COMMISSIONER','municipal'] },
      'SYSTEM_ADMIN': { $in: ['SYSTEM_ADMIN','admin'] },
    }
    query.role = roleMap[role] || role
  }

  if (role === 'active')   query.isActive = true
  if (role === 'inactive') query.isActive = false
  if (status === 'active')   query.isActive = true
  if (status === 'inactive') query.isActive = false
  if (wardId)       query.wardId = wardId
  if (departmentId) query.departmentId = departmentId

  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean()

  return Response.json({ success: true, data: users })
}
