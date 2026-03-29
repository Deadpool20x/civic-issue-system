// app/api/issues/admin/route.js
// Admin endpoint for managing all issues
import { connectDB } from '@/lib/mongodb';
import { getTokenData } from '@/lib/auth';
import { normalizeRole } from '@/lib/auth';
import Issue from '@/models/Issue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/issues/admin
 * Returns all issues for admin management
 * Accessible by: admin, commissioner only
 */
export async function GET(request) {
    try {
        // Verify authentication
        const userData = await getTokenData();
        
        if (!userData) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check role - allow admin and commissioner
        const userRole = normalizeRole(userData.role);
        if (userRole !== 'SYSTEM_ADMIN' && userRole !== 'MUNICIPAL_COMMISSIONER') {
            return new Response(JSON.stringify({ 
                error: 'Forbidden - Admin access required',
                yourRole: userData.role
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Connect to database
        await connectDB();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query - admin sees everything
        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        if (priority && priority !== 'all') {
            query.priority = priority;
        }

        // Get total count
        const total = await Issue.countDocuments(query);

        // Get paginated issues with populated fields
        const issues = await Issue.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .lean();

        return new Response(JSON.stringify({
            success: true,
            issues,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('[API /issues/admin] Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch issues',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
