import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for Render deployment
 * GET /api/health
 */
export async function GET() {
    // eslint-disable-next-line no-undef
    const env = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';
    
    let dbStatus = 'disconnected';
    
    try {
        // Try to connect to the database
        await connectDB();
        dbStatus = 'connected';
    } catch (error) {
        console.error('[Health Check] Database connection failed:', error.message);
        dbStatus = 'error: ' + error.message;
    }

    return NextResponse.json({
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: env,
        database: dbStatus,
        services: {
            mongodb: dbStatus === 'connected' ? 'up' : 'down',
            // AI services status would go here if they were required
        }
    });
}
