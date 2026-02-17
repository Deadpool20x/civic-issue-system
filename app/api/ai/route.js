import { authMiddleware } from '@/lib/auth';
import AIAnalyzer from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const POST = authMiddleware(async (req) => {
    try {
        const { action, issueData } = await req.json();

        if (!issueData) {
            return new Response(
                JSON.stringify({ error: 'Issue data is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let result;
        switch (action) {
            case 'analyze':
                result = await AIAnalyzer.analyzeIssue(issueData);
                break;
            case 'generate_response':
                result = await AIAnalyzer.generateResponse(issueData);
                break;
            default:
                return new Response(
                    JSON.stringify({ error: 'Invalid action' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('AI processing error:', error);
        return new Response(
            JSON.stringify({ error: 'AI processing failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});