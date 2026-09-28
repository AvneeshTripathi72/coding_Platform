import { GoogleGenerativeAI } from '@google/generative-ai';

const aiChat = async (req, res) => {
  try {
    const { message, problemContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.gemniKey;
    if (!geminiKey) {
      return res.status(500).json({ success: false, message: 'AI service is not configured (GEMINI_API_KEY missing)' });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    
    const modelNames = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-pro'
    ];
    
    let prompt = `You are a helpful coding assistant for a competitive programming platform called Code Verse. `;
    
    if (problemContext) {
      prompt += `\n\nProblem Context:\nTitle: ${problemContext.title || 'N/A'}\n`;
      if (problemContext.description) {
        prompt += `Description: ${problemContext.description.substring(0, 500)}...\n`;
      }
      if (problemContext.difficulty) {
        prompt += `Difficulty: ${problemContext.difficulty}\n`;
      }
      if (problemContext.tags && problemContext.tags.length > 0) {
        prompt += `Tags: ${problemContext.tags.join(', ')}\n`;
      }
    }

    prompt += `\n\nUser Question: ${message}\n\nPlease provide a helpful, clear, and concise answer. `;
    prompt += `If the question is about code, provide code examples when relevant. `;
    prompt += `If the question is about the problem, help guide the user without giving away the complete solution directly.`;

    let result;
    let lastError;
    
    for (const name of modelNames) {
      try {
        const testModel = genAI.getGenerativeModel({ model: name });
        result = await testModel.generateContent(prompt);
        break;
      } catch (apiError) {
        lastError = apiError;
        continue;
      }
    }
    
    if (!result) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown'}`);
    }
    
    const response = result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    
    let statusCode = 500;
    if (error.message?.includes('API key')) {
      statusCode = 401;
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      statusCode = 429;
    }
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get AI response'
    });
  }
};

export default aiChat;
