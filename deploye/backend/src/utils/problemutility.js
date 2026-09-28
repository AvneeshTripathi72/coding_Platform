import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const getLanguageId = (language) => {
  if (!language) return null;
  
  const normalized = language.toLowerCase().trim();
  
  const languageMap = {
    "python": 71,
    "javascript": 63,
    "java": 62,
    "c++": 54,
    "cpp": 54,
    "cplusplus": 54,
    "c": 50,
    "ruby": 72,
    "go": 60,
    "swift": 83,
    "kotlin": 78,
    "php": 68,
    "typescript": 74,
    "csharp": 51,
    "c#": 51,
  };
  
  return languageMap[normalized] || null;
};

const encodeBase64 = (str) => {
  if (!str) return '';
  return Buffer.from(str, 'utf8').toString('base64');
};

const decodeBase64 = (str) => {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) {
    return str;
  }
};

const submitBatch = async (submissions) => {
  const judge0Url = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions/batch';
  const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY;
  const rapidApiHost = process.env.JUDGE0_RAPID_HOST || 'judge0-ce.p.rapidapi.com';

  const encodedSubmissions = submissions.map(sub => ({
    ...sub,
    source_code: encodeBase64(sub.source_code),
    stdin: encodeBase64(sub.stdin || ''),
    expected_output: encodeBase64(sub.expected_output || '')
  }));

  const options = {
    method: 'POST',
    url: judge0Url,
    params: {
      base64_encoded: 'true'
    },
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': rapidApiHost,
      'Content-Type': 'application/json'
    },
    data: {
      submissions: encodedSubmissions
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error("Error in submitBatch:", err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message || "Judge0 batch submission failed");
  }
};

const submitToken = async (submissionResultsTokens, maxAttempts = 12, delayMs = 1200) => {
  if (!submissionResultsTokens || !Array.isArray(submissionResultsTokens) || submissionResultsTokens.length === 0) {
    throw new Error('No submission tokens provided');
  }

  const tokens1 = submissionResultsTokens.map(s => s.token).filter(Boolean);
  if (tokens1.length === 0) {
    throw new Error('Invalid submission tokens');
  }

  const tokenString = tokens1.join(",");
  const judge0Url = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions/batch';
  const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY;
  const rapidApiHost = process.env.JUDGE0_RAPID_HOST || 'judge0-ce.p.rapidapi.com';

  const options = {
    method: 'GET',
    url: judge0Url,
    params: {
      tokens: tokenString,
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': rapidApiHost
    }
  };

  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await axios(options);
      const results = response?.data?.submissions;

      if (!results || !Array.isArray(results)) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      const allCompleted = results.every(sub =>
        sub.status && sub.status.id !== 1 && sub.status.id !== 2 // 1: In Queue, 2: Processing
      );

      if (allCompleted) {
        const decodedData = {
          ...response.data,
          submissions: response.data.submissions.map(sub => ({
            ...sub,
            source_code: decodeBase64(sub.source_code),
            stdin: decodeBase64(sub.stdin),
            expected_output: decodeBase64(sub.expected_output),
            stdout: decodeBase64(sub.stdout),
            stderr: decodeBase64(sub.stderr),
            compile_output: decodeBase64(sub.compile_output),
            message: decodeBase64(sub.message)
          }))
        };
        return decodedData;
      }
    } catch (error) {
      console.warn(`Attempt ${attempts} error fetching Judge0 tokens:`, error.response?.data || error.message);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error(`Judge0 execution timed out after ${maxAttempts} polling attempts`);
};

export { getLanguageId, submitBatch, submitToken, encodeBase64, decodeBase64 };
