// app/api/issues/[id]/proof/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import Issue from '@/models/Issue'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    const user = await getUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only field officers can upload proof
    if (user.role !== 'FIELD_OFFICER') {
      return Response.json(
        { error: 'Only Field Officers can upload resolution proof' },
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

    const { note, images, videos } = body

    // Note is required
    if (!note || note.trim().length < 10) {
      return Response.json(
        { error: 'Resolution note must be at least 10 characters' },
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
        { error: 'You can only upload proof for issues in your ward' },
        { status: 403 }
      )
    }

    // Cannot upload proof for already resolved issues
    if (issue.status === 'resolved') {
      return Response.json(
        { error: 'Issue is already resolved' },
        { status: 400 }
      )
    }

    // Process proof images
    const proofImages = (images || []).map(img =>
      typeof img === 'string'
        ? { url: img, publicId: '' }
        : img
    )

    // Process proof videos
    const proofVideos = (videos || []).map(vid =>
      typeof vid === 'string'
        ? { url: vid, publicId: '', thumbnailUrl: '' }
        : vid
    )

    // Save resolution proof to issue
    issue.resolutionProof = {
      note: note.trim(),
      images: proofImages,
      videos: proofVideos,
      uploadedBy: user.userId,
      uploadedAt: new Date()
    }

    issue.updatedAt = new Date()
    await issue.save()

    return Response.json({
      success: true,
      message: 'Resolution proof uploaded successfully. You can now mark the issue as resolved.',
      data: {
        _id: issue._id,
        reportId: issue.reportId,
        hasProof: true,
        proofNote: note.trim()
      }
    })

  } catch (error) {
    console.error('Proof upload error:', error)
    return Response.json(
      { error: 'Failed to upload proof. Please try again.' },
      { status: 500 }
    )
  }
}
