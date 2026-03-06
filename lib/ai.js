import { GoogleGenerativeAI } from '@google/generative-ai';

class AIAnalyzer {
    // ---- NEW METHODS FOR PHASE 1: IMAGE DETECTION ----

    static async detectWithRoboflow(imageUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const model = process.env.ROBOFLOW_MODEL || 'pothole-detection';
            const version = process.env.ROBOFLOW_VERSION || '1';
            const apiKey = process.env.ROBOFLOW_API_KEY;

            if (!apiKey) throw new Error('No Roboflow API Key');

            const apiUrl = `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}&image=${encodeURIComponent(imageUrl)}`;

            const response = await fetch(apiUrl, { signal: controller.signal });
            if (!response.ok) throw new Error(`Roboflow response not OK: ${response.status}`);

            const data = await response.json();
            clearTimeout(timeoutId);

            if (data.predictions && data.predictions.length > 0) {
                // Find highest confidence prediction
                const best = data.predictions.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
                return {
                    source: 'roboflow',
                    category: best.class,
                    confidence: Math.round(best.confidence * 100),
                    raw: data
                };
            }
            throw new Error('No predictions from Roboflow');
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    static async analyzeWithGemini(imageUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('No Gemini API Key');

            const imageResp = await fetch(imageUrl, { signal: controller.signal });
            if (!imageResp.ok) throw new Error('Failed to fetch image for Gemini');

            const arrayBuffer = await imageResp.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `You are a civic issue analyzer. Analyze the provided image of a civic issue. 
Return ONLY a JSON payload with exactly this format:
{
  "category": "detected category name here",
  "subcategory": "detected subcategory name here",
  "confidence": <integer between 0 and 100>
}

The category MUST be exactly one of these keys:
"roads-infrastructure", "street-lighting", "waste-management", "water-drainage", "parks-public-spaces", "traffic-signage", "public-health-safety", "other"`;

            const imagePart = {
                inlineData: { data: base64Image, mimeType }
            };

            const result = await model.generateContent([prompt, imagePart]);
            const text = result.response.text();
            clearTimeout(timeoutId);

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    source: 'gemini',
                    category: parsed.category,
                    subcategory: parsed.subcategory,
                    confidence: parsed.confidence,
                    raw: parsed
                };
            }

            throw new Error('Failed to parse Gemini JSON');
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    static async analyzeWithOpenAIFallback(imageUrl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error('No OpenAI API Key');

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI assistant that analyzes images of civic issues. Respond ONLY with a JSON object: {"category": "category-key", "subcategory": "Subcategory Name", "confidence": 90}\nCategory must be one of: roads-infrastructure, street-lighting, waste-management, water-drainage, parks-public-spaces, traffic-signage, public-health-safety, other.'
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Identify the primary civic issue category from this image.' },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    temperature: 0.1
                }),
                signal: controller.signal
            });

            if (!response.ok) throw new Error('OpenAI response not OK');

            const data = await response.json();
            clearTimeout(timeoutId);

            const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    source: 'openai',
                    category: parsed.category || 'other',
                    subcategory: parsed.subcategory,
                    confidence: parsed.confidence || 50,
                    raw: parsed
                };
            }

            throw new Error('Failed to parse OpenAI JSON');
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }


    // ---- ORIGINAL TEXT ANALYSIS METHODS ----

    static async analyzeIssue(issueData) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI assistant that analyzes civic issues and provides structured analysis including category, priority, sentiment, and keywords.'
                        },
                        {
                            role: 'user',
                            content: `Please analyze this civic issue and provide a JSON response with category (water/electricity/roads/garbage/parks/other), priority (low/medium/high/urgent), sentiment (positive/neutral/negative), and relevant keywords. Issue details:\nTitle: ${issueData.title}\nDescription: ${issueData.description}`
                        }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI analysis');
            }

            const data = await response.json();
            let analysis;
            try {
                analysis = JSON.parse(data.choices[0].message.content);
            } catch (parseError) {
                console.error('AI response parsing error:', parseError);
                return {
                    category: determineCategoryByKeywords(issueData.title + ' ' + issueData.description),
                    priority: determinePriorityByKeywords(issueData.title + ' ' + issueData.description),
                    sentiment: 'neutral',
                    keywords: extractKeywords(issueData.title + ' ' + issueData.description)
                };
            }

            return {
                category: analysis.category,
                priority: analysis.priority,
                sentiment: analysis.sentiment,
                keywords: analysis.keywords
            };

        } catch (error) {
            console.error('AI analysis error:', error);
            return {
                category: determineCategoryByKeywords(issueData.title + ' ' + issueData.description),
                priority: determinePriorityByKeywords(issueData.title + ' ' + issueData.description),
                sentiment: 'neutral',
                keywords: extractKeywords(issueData.title + ' ' + issueData.description)
            };
        }
    }

    static async generateResponse(issueData) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful municipal officer responding to citizen issues. Provide clear, professional, and actionable responses.'
                        },
                        {
                            role: 'user',
                            content: `Please generate an initial response for this civic issue:\nTitle: ${issueData.title}\nDescription: ${issueData.description}\nCategory: ${issueData.category}`
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate response');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Response generation error:', error);
            return getDefaultResponse(issueData.category);
        }
    }
}

// Fallback functions for when AI service is unavailable
function determineCategoryByKeywords(text) {
    const keywords = {
        water: ['water', 'pipe', 'leak', 'flood', 'drainage'],
        electricity: ['electricity', 'power', 'light', 'electric', 'voltage'],
        roads: ['road', 'street', 'pothole', 'traffic', 'signal'],
        garbage: ['garbage', 'waste', 'trash', 'dump', 'clean'],
        parks: ['park', 'garden', 'playground', 'tree', 'grass']
    };

    const textLower = text.toLowerCase();
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
        if (categoryKeywords.some(keyword => textLower.includes(keyword))) {
            return category;
        }
    }
    return 'other';
}

function determinePriorityByKeywords(text) {
    const textLower = text.toLowerCase();

    const urgentKeywords = ['emergency', 'urgent', 'immediate', 'danger', 'hazard'];
    const highKeywords = ['major', 'significant', 'serious', 'important'];
    const lowKeywords = ['minor', 'small', 'slight', 'minimal'];

    if (urgentKeywords.some(keyword => textLower.includes(keyword))) {
        return 'urgent';
    } else if (highKeywords.some(keyword => textLower.includes(keyword))) {
        return 'high';
    } else if (lowKeywords.some(keyword => textLower.includes(keyword))) {
        return 'low';
    }
    return 'medium';
}

function extractKeywords(text) {
    const commonKeywords = {
        water: ['leak', 'pipe', 'pressure', 'supply', 'drainage'],
        electricity: ['power', 'outage', 'voltage', 'wire', 'connection'],
        roads: ['pothole', 'traffic', 'signal', 'repair', 'construction'],
        garbage: ['waste', 'collection', 'dump', 'cleanup', 'bins'],
        parks: ['maintenance', 'equipment', 'safety', 'lighting', 'cleanliness']
    };

    const textLower = text.toLowerCase();
    const keywords = [];

    Object.values(commonKeywords).flat().forEach(keyword => {
        if (textLower.includes(keyword)) {
            keywords.push(keyword);
        }
    });

    return keywords;
}

function getDefaultResponse(category) {
    const responses = {
        water: 'Thank you for reporting the water-related issue. Our water department will investigate and take necessary action.',
        electricity: 'We have received your electricity-related complaint. Our electrical team will assess the situation.',
        roads: 'Thank you for bringing this road issue to our attention. Our roads department will review and plan appropriate action.',
        garbage: 'We acknowledge your waste management concern. Our sanitation team will address this issue.',
        parks: 'Thank you for reporting this parks-related issue. Our parks maintenance team will look into it.',
        other: 'Thank you for your report. We will review and assign it to the appropriate department.'
    };

    return responses[category] || responses.other;
}

export default AIAnalyzer;