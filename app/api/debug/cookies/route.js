import { NextResponse } from 'next/server'

export async function GET(request) {
    const token = request.cookies.get('token')?.value

    return NextResponse.json({
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenStart: token ? token.substring(0, 20) + '...' : null,
        message: token ? 'Token found!' : 'No token found',
    })
}
