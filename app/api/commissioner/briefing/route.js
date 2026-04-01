// app/api/commissioner/briefing/route.js
import { connectDB } from '@/lib/mongodb'
import { getUser } from '@/lib/auth'
import Issue from '@/models/Issue'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'MUNICIPAL_COMMISSIONER') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()

  // Get city-wide stats for briefing
  const [total, resolved, pending, overdue, urgent] = await Promise.all([
    Issue.countDocuments({}),
    Issue.countDocuments({ status: 'resolved' }),
    Issue.countDocuments({ status: 'pending' }),
    Issue.countDocuments({ 'sla.isOverdue': true }),
    Issue.countDocuments({ priority: 'urgent' }),
  ])

  const resolutionRate = total > 0
    ? Math.round((resolved / total) * 100)
    : 0

  const cityHealth = total > 0
    ? Math.round(((total - overdue) / total) * 100)
    : 100

  // Generate briefing from real data
  const briefing = {
    date: new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    title: `Daily City Operations Briefing — Anand District`,
    summary: `As of today, the city has ${total} total reported issues with a ${resolutionRate}% resolution rate. ${overdue} issues are currently overdue and require immediate attention. City SLA health stands at ${cityHealth}%.`,
    keyPoints: [
      `${total} total issues across all 16 wards`,
      `${resolved} issues resolved (${resolutionRate}% resolution rate)`,
      `${pending} issues pending assignment`,
      `${cityHealth}% overall SLA compliance`,
    ],
    criticalAlerts: overdue > 0
      ? [
          `${overdue} issues have breached SLA deadline`,
          `${urgent} urgent priority issues require immediate action`,
        ]
      : ['No critical SLA breaches at this time'],
    stats: {
      total, resolved, pending, overdue, urgent, cityHealth
    }
  }

  return Response.json({ success: true, briefing })
}

export async function POST(request) {
  // Regenerate briefing on demand
  return GET(request)
}
