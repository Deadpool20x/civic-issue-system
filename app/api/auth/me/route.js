import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function GET(request) {
    const user = await getUser(request)
    // Return 200 with user: null instead of 401 to keep logs clean for unauthenticated users
    return NextResponse.json({ success: true, user: user || null })
}