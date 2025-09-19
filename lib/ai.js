class AIAnalyzer {
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

            // ... other code in lib/ai.js

            const data = await response.json();
            let analysis;
            try {
                analysis = JSON.parse(data.choices[0].message.content);
            } catch (parseError) {
                console.error('AI response parsing error:', parseError);
                // If parsing fails, return a fallback analysis
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

            // ... rest of the file
        } catch (error) {
            console.error('AI analysis error:', error);
            // Provide fallback analysis based on simple keyword matching
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