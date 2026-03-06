import { NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/ai';

export const maxDuration = 15; // Set max duration for Vercel

export async function POST(request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        // Parallel execution of Roboflow and Gemini
        const [roboflowResult, geminiResult] = await Promise.allSettled([
            AIAnalyzer.detectWithRoboflow(imageUrl),
            AIAnalyzer.analyzeWithGemini(imageUrl)
        ]);

        if (roboflowResult.status === 'fulfilled') {
            return NextResponse.json({
                success: true,
                detection: roboflowResult.value
            });
        }

        // If Roboflow failed/timed out, try Gemini
        if (geminiResult.status === 'fulfilled') {
            return NextResponse.json({
                success: true,
                detection: geminiResult.value
            });
        }

        // Both failed, fallback to OpenAI
        try {
            console.log('Roboflow and Gemini both failed/timed out, falling back to OpenAI...', {
                roboflowErr: roboflowResult.reason?.message,
                geminiErr: geminiResult.reason?.message
            });
            const openaiResult = await AIAnalyzer.analyzeWithOpenAIFallback(imageUrl);
            return NextResponse.json({
                success: true,
                detection: openaiResult
            });
        } catch (openaiErr) {
            // All AI failed, fallback to a "manual" state
            console.error('All CV models failed:', openaiErr);
            return NextResponse.json({
                success: false,
                error: 'AI detection failed across all models',
                detection: {
                    source: 'manual',
                    category: null,
                    confidence: 0
                }
            });
        }
    } catch (error) {
        console.error('AI Detection API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
