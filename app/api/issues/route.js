import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import { getRoleFilter } from '@/lib/roleFilter'
import { getDepartmentCodeForCategory } from '@/lib/department-mapper'
import { getWardByZoneDept, WARD_MAP } from '@/lib/wards'
import { getZoneFromCoordinates } from '@/lib/zones'
import { createNotification } from '@/lib/notifications'
import Issue from '@/models/Issue'
import User from '@/models/User'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ─────────────────────────────────────────────
// GET /api/issues — fetch issues filtered by role
// ─────────────────────────────────────────────
export async function GET(request) {
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const filter = getRoleFilter(user)

  // SYSTEM_ADMIN — filter is null — still allow read
  // getRoleFilter returns null for admin
  // Admin can read all issues (read only)
  const query = filter === null ? {} : { ...filter }

  await connectDB()

  const { searchParams } = new URL(request.url)
  const status   = searchParams.get('status')
  const priority = searchParams.get('priority')
  const wardId   = searchParams.get('ward')

  if (status)   query.status = status
  if (priority) query.priority = priority

  // Ward filter — only apply if within role's allowed wards
  if (wardId) {
    const roleFilter = filter || {}
    if (roleFilter.ward && typeof roleFilter.ward === 'string') {
      // Field officer — ward is fixed, ignore URL ward param
    } else if (roleFilter.ward?.$in) {
      // Dept manager — only allow their 2 wards
      if (roleFilter.ward.$in.includes(wardId)) {
        query.ward = wardId
      }
    } else {
      // Commissioner or Admin — any ward allowed
      query.ward = wardId
    }
  }

  const issues = await Issue.find(query)
    .sort({ createdAt: -1 })
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name')
    .lean()

  return Response.json({
    success: true,
    data: issues,
    count: issues.length
  })
}

// ─────────────────────────────────────────────
// POST /api/issues — create new issue (citizen only)
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    // Auth check
    const user = await getUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only citizens can create issues
    if (!['CITIZEN', 'citizen'].includes(user.role)) {
      return Response.json(
        { error: 'Only citizens can report issues' },
        { status: 403 }
      )
    }

    // Parse body
    let body
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Manual validation — no zod needed
    const { title, description, category, subcategory,
            location, images, videos, priority } = body

    if (!title || title.trim().length < 5) {
      return Response.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 10) {
      return Response.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }

    const validCategories = [
      'roads-infrastructure', 'street-lighting', 'waste-management',
      'water-drainage', 'parks-public-spaces', 'traffic-signage',
      'public-health-safety', 'other'
    ]
    if (!category || !validCategories.includes(category)) {
      return Response.json(
        { error: 'Valid category is required' },
        { status: 400 }
      )
    }

    if (!subcategory || subcategory.trim().length === 0) {
      return Response.json(
        { error: 'Subcategory is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Process location
    let processedLocation = {
      address: location?.address || 'Address not provided',
      city:    location?.city    || '',
      state:   location?.state   || '',
      pincode: location?.pincode || ''
    }

    let lat = null
    let lng = null

    if (location?.coordinates?.lat && location?.coordinates?.lng) {
      lat = parseFloat(location.coordinates.lat)
      lng = parseFloat(location.coordinates.lng)

      if (!isNaN(lat) && !isNaN(lng)) {
        processedLocation.coordinates = {
          type: 'Point',
          coordinates: [lng, lat] // MongoDB format: [lng, lat]
        }
      }
    }

    // Auto-assign ward from location + category
    // Citizen does NOT pick ward — it is derived automatically
    const deptCode = getDepartmentCodeForCategory(category)
    let finalWardId = null

    if (lat !== null && lng !== null) {
      const zone = getZoneFromCoordinates(lat, lng)
      const wardObj = getWardByZoneDept(zone, deptCode)
      if (wardObj) {
        finalWardId = wardObj.wardId
      }
    }

    // Fallback if no coordinates — default to north zone
    if (!finalWardId) {
      const wardObj = getWardByZoneDept('north', deptCode)
      finalWardId = wardObj?.wardId || 'ward-8'
    }

    // Calculate priority
    const issuePriority = priority || 'medium'
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const finalPriority = validPriorities.includes(issuePriority)
      ? issuePriority : 'medium'

    // Calculate SLA deadline
    const now = new Date()
    const slaHours = {
      urgent: 24, high: 48, medium: 72, low: 120
    }
    const hoursToAdd = slaHours[finalPriority] || 72
    const slaDeadline = new Date(
      now.getTime() + hoursToAdd * 60 * 60 * 1000
    )
    const dueTime = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000
    )

    // Process images
    const processedImages = (images || []).map(img =>
      typeof img === 'string'
        ? { url: img, publicId: '' }
        : img
    )

    // Process videos
    const processedVideos = (videos || []).map(vid =>
      typeof vid === 'string'
        ? { url: vid, publicId: '', thumbnailUrl: '' }
        : vid
    )

    // Build issue data
    const issueData = {
      title:                title.trim(),
      description:          description.trim(),
      location:             processedLocation,
      category,
      subcategory:          subcategory.trim(),
      priority:             finalPriority,
      images:               processedImages,
      videos:               processedVideos,
      reportedBy:           user.userId,
      ward:                 finalWardId,
      zone:                 WARD_MAP[finalWardId]?.zone || 'north',
      assignedDepartmentCode: deptCode,
      detectionSource:      'manual',
      status:               'pending',
      sla: {
        deadline: slaDeadline
      },
      dueTime
    }

    // Auto-assign to Field Officer for this ward
    const officer = await User.findOne({
      role: 'FIELD_OFFICER',
      wardId: finalWardId,
      isActive: true
    })

    if (officer) {
      issueData.assignedTo = officer._id
      issueData.status = 'assigned'
    }

    // Create issue
    const issue = await Issue.create(issueData)

    // Notify assigned officer
    if (issue.status === 'assigned' && issue.assignedTo) {
      try {
        await createNotification({
          userId: issue.assignedTo,
          type: 'NEW_ASSIGNMENT',
          issueId: issue._id,
          title: 'New Assignment',
          message: `Issue ${issue.reportId} assigned to you in ${finalWardId}`
        })
      } catch (notifErr) {
        // Notification failure should not block issue creation
        console.error('Notification error:', notifErr)
      }
    }

    return Response.json({
      success: true,
      message: 'Issue reported successfully',
      reportId: issue.reportId,
      ward: finalWardId,
      wardLabel: `Ward ${WARD_MAP[finalWardId]?.wardNumber} — ${
        WARD_MAP[finalWardId]?.zone === 'north' ? 'North' : 'South'
      } Zone`,
      data: {
        _id: issue._id,
        reportId: issue.reportId,
        status: issue.status,
        ward: issue.ward,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Issue creation error:', error)
    return Response.json(
      { error: 'Failed to create issue. Please try again.' },
      { status: 500 }
    )
  }
}
