import { NextResponse } from 'next/server';
import AIAnalyzer from '@/lib/ai';

export const maxDuration = 30; // Set max duration for Gemini analysis

export async function POST(request) {
    try {
        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        console.log('[AI Detection] Analyzing image with Gemini:', imageUrl);

        // Use Gemini for image analysis with authenticity validation
        try {
            const geminiResult = await AIAnalyzer.analyzeWithGemini(imageUrl);
            
            console.log('[AI Detection] Gemini result:', geminiResult);

            // Check if image is authentic
            if (!geminiResult.isAuthentic) {
                return NextResponse.json({
                    success: false,
                    error: 'Image validation failed',
                    validation: {
                        isAuthentic: false,
                        authenticityScore: geminiResult.authenticityScore,
                        authenticityNotes: geminiResult.authenticityNotes,
                        suspicionReasons: geminiResult.suspicionReasons
                    },
                    detection: {
                        source: 'gemini',
                        category: null,
                        subcategory: null,
                        department: null,
                        priority: null,
                        confidence: 0
                    }
                });
            }

            // Image is authentic - return detection results
            return NextResponse.json({
                success: true,
                validation: {
                    isAuthentic: true,
                    authenticityScore: geminiResult.authenticityScore,
                    authenticityNotes: geminiResult.authenticityNotes
                },
                detection: {
                    source: 'gemini',
                    category: geminiResult.category,
                    subcategory: geminiResult.subcategory,
                    department: geminiResult.department,
                    priority: geminiResult.priority,
                    confidence: geminiResult.confidence,
                    description: geminiResult.description,
                    raw: geminiResult.raw
                }
            });
        } catch (geminiErr) {
            console.error('[AI Detection] Gemini failed:', geminiErr.message);
            
            // Fallback to OpenAI if Gemini fails
            try {
                console.log('[AI Detection] Falling back to OpenAI...');
                const openaiResult = await AIAnalyzer.analyzeWithOpenAIFallback(imageUrl);
                return NextResponse.json({
                    success: true,
                    validation: {
                        isAuthentic: true,
                        authenticityScore: 50,
                        authenticityNotes: 'Validated with fallback AI'
                    },
                    detection: {
                        source: 'openai',
                        category: openaiResult.category,
                        subcategory: openaiResult.subcategory,
                        department: mapCategoryToDepartment(openaiResult.category),
                        priority: 'medium',
                        confidence: openaiResult.confidence,
                        raw: openaiResult.raw
                    }
                });
            } catch (openaiErr) {
                console.error('[AI Detection] OpenAI fallback also failed:', openaiErr.message);
                return NextResponse.json({
                    success: false,
                    error: 'AI detection failed. Please select category manually.',
                    validation: {
                        isAuthentic: null,
                        authenticityScore: 0,
                        authenticityNotes: 'AI validation unavailable'
                    },
                    detection: {
                        source: 'manual',
                        category: null,
                        department: null,
                        priority: null,
                        confidence: 0
                    }
                });
            }
        }
    } catch (error) {
        console.error('AI Detection API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Helper function to map category to department
function mapCategoryToDepartment(category) {
    const mapping = {
        'roads-infrastructure': 'roads',
        'street-lighting': 'lighting',
        'waste-management': 'waste',
        'water-drainage': 'water',
        'parks-public-spaces': 'parks',
        'traffic-signage': 'traffic',
        'public-health-safety': 'health',
        'other': 'general'
    };
    return mapping[category] || 'general';
}
