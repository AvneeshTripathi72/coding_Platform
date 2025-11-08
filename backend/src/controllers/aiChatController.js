import { GoogleGenerativeAI } from '@google/generative-ai';

const aiChat = async (req, res) => {
  try {
    console.log('AI Chat endpoint hit');
    const { message, problemContext } = req.body;
    const userId = req.user?._id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const geminiKey = process.env.gemniKey;
    console.log('Gemini API key exists:', !!geminiKey);
    console.log('API key starts with:', geminiKey ? geminiKey.substring(0, 10) + '...' : 'N/A');
    if (!geminiKey) {
      console.error('Gemini API key not found in environment variables');
      return res.status(500).json({ message: 'AI service is not configured' });
    }
    
    if (!geminiKey.startsWith('AIza')) {
      console.error('API key format appears invalid (should start with AIza)');
      return res.status(500).json({ message: 'Invalid API key format' });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    
    const modelNames = [
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];
    
    let model = genAI.getGenerativeModel({ model: modelNames[0] });
    let modelName = modelNames[0];
    console.log(`Initialized Gemini model: ${modelName}`);

    let prompt = `You are a helpful coding assistant for a competitive programming platform. `;
    
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
    prompt += `If the question is about the problem, help guide the user without giving away the complete solution.`;

    console.log(`Sending request to Gemini API using model: ${modelName}...`);
    
    let result;
    let lastError;
    
    for (const name of modelNames) {
      try {
        const testModel = genAI.getGenerativeModel({ model: name });
        console.log(`Trying API call with model: ${name}`);
        result = await testModel.generateContent(prompt);
        modelName = name;
        console.log(`Successfully used model: ${name}`);
        break;
      } catch (apiError) {
        console.log(`Model ${name} failed:`, apiError.message);
        lastError = apiError;
        continue;
      }
    }
    
    if (!result) {
      throw new Error(`All models failed. Tried: ${modelNames.join(', ')}. Last error: ${lastError?.message || 'Unknown'}`);
    }
    
    console.log('Received response from Gemini API');
    const response = result.response;
    const text = response.text();
    console.log('Response text length:', text?.length);

    res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error('AI Chat Error Details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Failed to get AI response';
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key in .env file';
      statusCode = 401;
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorMessage = 'API quota exceeded. Please check your Google AI Studio quota';
      statusCode = 429;
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = 'Model not found. The API model name may have changed.';
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.response) {
      console.error('Gemini API response:', error.response);
    }
    
    res.status(statusCode).json({
      message: errorMessage,
      error: error.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        fullError: error.toString()
      } : undefined,
    });
  }
};

export default aiChat;
