import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const { 
      title, content, metaDescription, excerpt, seoTitle, ogTitle, ogDescription, 
      keywords, tags, faqs, keyTakeaways, semanticMentions, category
    } = data;

    // Use Gemini-2.5-flash for fast and cost-effective text generation
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert SEO auditor and content strategist.
Your task is to analyze the following blog post and suggest high-quality SEO values ONLY for the fields that are currently EMPTY or MISSING. 
Do not suggest values for fields that already have content.

Blog Post Context:
Title: ${title || 'Untitled'}
Category: ${category || 'General'}
Content (HTML snippet): ${content ? content : 'Empty'}

Current Field Status:
- metaDescription: ${metaDescription ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- excerpt: ${excerpt ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- seoTitle: ${seoTitle ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- ogTitle: ${ogTitle ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- ogDescription: ${ogDescription ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- keywords (comma separated LSI): ${keywords ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- tags (comma separated): ${tags && tags.length > 0 ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion)'}
- faqs (JSON array): ${faqs && faqs.length > 0 ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion: Provide 2-3 FAQ nodes as JSON array with "question" and "answer")'}
- keyTakeaways (JSON array of strings): ${keyTakeaways && keyTakeaways.length > 0 ? 'HAS CONTENT (Ignore)' : 'EMPTY (Need suggestion: Provide 3-4 bullet points as array of strings)'}
- optimizedContent: Analyze the "Content (HTML snippet)" and properly restructure the heading tags (<h1> to <h6>) for best SEO practices. CRITICAL RULE: DO NOT CHANGE A SINGLE WORD, CHARACTER, OR LINK of the actual text. ONLY change the <hX> HTML tags to establish a proper hierarchy (e.g. changing <h3> to <h2> if it should be a main section).

Respond STRICTLY in JSON format matching this interface. If a field already has content, omit it from the JSON (except for optimizedContent which you must always return if content is provided).
Make the "message" field conversational in Hindi/English mix (Hinglish) telling the user that they missed this feature and should add it.
{
  "metaDescription"?: { "message": "Aapne Meta Description add nahi kiya hai.", "value": "A 150-160 character optimized description" },
  "excerpt"?: { "message": "Aapne Excerpt chhod diya hai.", "value": "A short summary for the blog feed" },
  "seoTitle"?: { "message": "Aapka SEO Title missing hai.", "value": "A catchy, keyword-rich SEO title under 60 chars" },
  "ogTitle"?: { "message": "Social media ke liye ogTitle add nahi kiya hai.", "value": "A compelling social media title" },
  "ogDescription"?: { "message": "Social media description missing hai.", "value": "A compelling social media description" },
  "keywords"?: { "message": "Keywords add nahi kiye gaye hain.", "value": "comma, separated, lsi, keywords" },
  "tags"?: { "message": "Aapne Tags add nahi kiye hain.", "value": ["array", "of", "relevant", "tags"] },
  "faqs"?: { "message": "Aapne FAQs nahi banaye hain.", "value": [{"question": "Q1?", "answer": "A1"}] },
  "keyTakeaways"?: { "message": "Key Takeaways missing hain.", "value": ["Takeaway 1", "Takeaway 2"] },
  "optimizedContent"?: { "message": "Headings ko SEO ke hisaab se restructure kiya gaya hai.", "value": "The full HTML content with ONLY the <hX> heading tags restructured for SEO." }
}
`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    
    const responseText = result.response.text();
    let suggestions = {};
    
    try {
      suggestions = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, suggestions });

  } catch (error: any) {
    console.error('AI SEO Audit Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
