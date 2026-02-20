import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for Render deployment
 * GET /api/health
 */
export async function GET() {
    // eslint-disable-next-line no-undef
    const env = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env
    });
}
