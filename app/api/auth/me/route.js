import { getTokenData } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        const userData = await getTokenData();

        if (!userData) {
            return new Response(
                JSON.stringify({ error: 'Not authenticated' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await connectDB();
        const user = await User.findById(userData.userId)
            .populate('department', 'name description contactEmail')
            .select('-password');

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        
        if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
             return new Response(
                JSON.stringify({ error: 'Database service unavailable' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}