import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function suggestReply(messageHistory, context = {}) {
  const { businessName, description, website, social, knowledgeBase, persona } = context;

  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    return mockAISuggestion(messageHistory);
  }

  try {
    const prompt = `
      ROLE: You are the official AI Representative for ${businessName || 'this business'}.
      PERSONA: ${persona || 'Helpful, professional, and efficient.'}
      
      BUSINESS CONTEXT:
      Description: ${description || 'A professional service provider.'}
      Website: ${website || 'Not provided'}
      Social Handles: ${social || 'Not provided'}
      
      DEEP KNOWLEDGE BASE:
      ${knowledgeBase || 'Use general professional knowledge. Be polite and helpful.'}
      
      INSTRUCTIONS:
      1. Use the knowledge base provided above to answer the user's specific questions.
      2. If you don't know the answer based on the context, respond with: "I'm sorry, I'm still learning about that. Let me connect you with our human support team. [HANDOVER_REQUIRED]"
      3. If the customer sounds frustrated, angry, or asks for a person, respond with: "[HANDOVER_REQUIRED]" and stop immediately.
      4. Keep the reply professional, concise (under 50 words), and helpful.
      
      MESSAGE HISTORY:
      ${messageHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}
      
      SUGGESTED REPLY:`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return mockAISuggestion(messageHistory);
  }
}

function mockAISuggestion(history) {
  const lastMessage = history[history.length - 1];
  const text = lastMessage.text.toLowerCase();

  if (text.includes('price') || text.includes('cost')) {
    return "Our Pro plan is $49/mo and includes bulk messaging. Would you like a detailed breakdown?";
  }
  if (text.includes('api')) {
    return "Yes, we provide full API access! You can find the documentation in the settings tab.";
  }
  if (text.includes('hello') || text.includes('hi')) {
    return "Hello! How can I assist you with your messaging campaigns today?";
  }
  if (text.includes('thanks') || text.includes('thank')) {
    return "You're very welcome! Let me know if you need anything else.";
  }

  return "I've noted your request. Let me check the details and get back to you shortly!";
}

export function detectOptOut(text) {
  const optOutKeywords = ['stop', 'unsubscribe', 'remove', 'cancel', 'opt out', 'block', 'supress', 'suppress', 'mute'];
  const lowerText = text.toLowerCase().trim();
  return optOutKeywords.some(keyword => lowerText.includes(keyword));
}

export async function suggestProfileOptimization(profileData) {
  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    return {
      bio: `🚀 ${profileData.username || 'Business'} | Expert Solutions\n📍 Based in World\n👇 Get started here!`,
      keywords: ['Professional', 'Expert', 'Growth'],
      hashtagClusters: [
        { label: 'Growth', tags: ['business', 'success', 'motivation'] },
        { label: 'Industry', tags: ['marketing', 'tech', 'innovation'] }
      ],
      strategy: {
        pillars: [
          { title: 'Educational', description: 'Share tips and how-tos.' },
          { title: 'Behind the scenes', description: 'Build trust by showing the process.' }
        ],
        proTip: 'Post consistently between 6 PM - 9 PM for maximum reach.'
      }
    };
  }

  try {
    const prompt = `
      TASK: Analyze this Instagram Profile and provide a high-performance SEO Optimization Plan.
      PROFILE DATA:
      Username: @${profileData.username}
      Current Bio: ${profileData.biography || 'Not provided'}
      Followers: ${profileData.followers_count || 0}
      
      RETURN JSON ONLY in this format:
      {
        "bio": "string (multiline, include emojis, keywords, and CTA)",
        "keywords": ["array", "of", "high-volume", "keywords"],
        "hashtagClusters": [
          { "label": "string", "tags": ["array", "of", "30", "tags"] }
        ],
        "strategy": {
          "pillars": [{ "title": "string", "description": "string" }],
          "proTip": "string"
        }
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    // Extract JSON from potential markdown blocks
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    return null;
  }
}

export async function detectScam(text) {
  if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    const scamKeywords = ['crypto', 'bitcoin', 'investment', 'rich', 'giveaway', 'winner', 'claim', 'free money', 'whatsapp me', 'telegram me'];
    const lowerText = text.toLowerCase();
    return scamKeywords.some(kw => lowerText.includes(kw));
  }
  
  try {
    const prompt = `Analyze the following social media comment for potential scams, phishing, malicious intent, or spam. 
    Comment: "${text}"
    
    If it looks like a scam, phishing, or unsolicited spam, respond with "SCAM". 
    If it is a legitimate comment or question, respond with "SAFE".
    
    RESPONSE:`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const prediction = response.text().trim().toUpperCase();
    
    console.log(`[AI Scam Check] Text: "${text.substring(0, 30)}..." -> Prediction: ${prediction}`);
    return prediction.includes('SCAM');
  } catch (e) {
    console.error('[AI Scam Check] Error:', e.message);
    return false;
  }
}
