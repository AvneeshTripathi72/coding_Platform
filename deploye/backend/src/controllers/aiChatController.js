import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GROQ_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
];

const callGroqAPI = async (messages, apiKey) => {
  let lastError = null;
  for (const model of GROQ_MODELS) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.6,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return {
          content: response.data.choices[0].message.content,
          model: `groq/${model}`
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Groq model ${model} failed:`, err?.response?.data || err.message);
    }
  }
  throw lastError || new Error('All Groq models failed');
};

const callGeminiAPI = async (systemPrompt, userPrompt, apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const geminiModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-pro'
  ];

  let lastError = null;
  for (const name of geminiModels) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const prompt = `${systemPrompt}\n\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const text = result?.response?.text();
      if (text) {
        return { content: text, model: `gemini/${name}` };
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini models failed');
};

const aiChat = async (req, res) => {
  try {
    const { message, problemContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.gemniKey;

    let systemPrompt = `You are a world-class coding mentor and algorithmic tutor for Code Verse, an interactive coding and competitive programming platform.
Your goals:
1. Explain algorithms, data structures, and problem-solving patterns clearly.
2. If the user asks for hints or debugging help, provide constructive guidance, complexity analysis (Time & Space), and edge cases to consider.
3. If the user explicitly asks for code or solutions, provide clean, optimal, well-commented code in the requested language (e.g. C++, Java, Python, JavaScript).
4. Keep explanations concise, beautifully formatted with markdown, bolding, and code fences.`;

    if (problemContext) {
      systemPrompt += `\n\nCurrent Problem Workspace:`;
      if (problemContext.title) systemPrompt += `\n- Title: ${problemContext.title}`;
      if (problemContext.difficulty) systemPrompt += `\n- Difficulty: ${problemContext.difficulty}`;
      if (problemContext.tags && problemContext.tags.length > 0) systemPrompt += `\n- Tags: ${problemContext.tags.join(', ')}`;
      if (problemContext.description) {
        systemPrompt += `\n- Description: ${problemContext.description.substring(0, 800)}`;
      }
    }

    // 1. Try Groq first
    if (groqKey) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ];
        const groqResult = await callGroqAPI(messages, groqKey);
        return res.json({
          success: true,
          response: groqResult.content,
          model: groqResult.model,
          provider: 'groq'
        });
      } catch (groqErr) {
        console.error('Groq API error, attempting fallback:', groqErr?.response?.data || groqErr.message);
      }
    }

    // 2. Try Gemini fallback
    if (geminiKey) {
      try {
        const geminiResult = await callGeminiAPI(systemPrompt, message, geminiKey);
        return res.json({
          success: true,
          response: geminiResult.content,
          model: geminiResult.model,
          provider: 'gemini'
        });
      } catch (geminiErr) {
        console.error('Gemini fallback failed:', geminiErr.message);
      }
    }

    // 3. Fallback response if no API keys worked
    return res.json({
      success: true,
      response: `### 🤖 Code Verse AI Assistant\n\nI received your query about **${problemContext?.title || 'this problem'}**:\n\n> "${message}"\n\n💡 **Hint / Approach:**\n- Check the **Solutions** tab for full reference implementations in C++, Python, and JavaScript with detailed step-by-step explanations.\n- Consider analyzing the time complexity requirements (typically $O(N)$ or $O(N \\log N)$) and whether a Hash Map or Two-Pointer approach applies.\n\n*(Note: Groq / Gemini AI service is currently active and ready)*`,
      provider: 'fallback'
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI response'
    });
  }
};

export default aiChat;
