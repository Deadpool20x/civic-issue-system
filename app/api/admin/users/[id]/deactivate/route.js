// app/api/admin/users/[id]/deactivate/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import User from '@/models/User'

export async function PATCH(request, { params }) {
  const user = await getUser(request)
  if (!['SYSTEM_ADMIN','admin'].includes(user?.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  await connectDB()
  await User.findByIdAndUpdate(params.id, { isActive: false })
  return Response.json({ success: true, message: 'User deactivated' })
}
