
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

    const encodedSubmissions = submissions.map(sub => ({
      ...sub,
      source_code: encodeBase64(sub.source_code),
      stdin: encodeBase64(sub.stdin || ''),
      expected_output: encodeBase64(sub.expected_output || '')
    }));

    const options = {
      method: 'POST',
      url: process.env.JUDGE0_URL,
      params: {
        base64_encoded: 'true'
      },
      headers: {
        'x-rapidapi-key': process.env.JUDGE0_RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.JUDGE0_RAPID_HOST,
        'Content-Type': 'application/json'
      },
      data: {
        submissions: encodedSubmissions
      }
    };

    try {
      const response = await axios.request(options);
      return response.data;
    }
    catch(err){
      console.log("Error in submitBatch:", err);
      throw err;
    }
}

const submitToken =  async (submissionResultsTokens) => {
  const tokens1 = submissionResultsTokens.map(s => s.token);
  const tokenString = tokens1.join(",");
  const options = {
    method: 'GET',
    url: process.env.JUDGE0_URL,
    params: {
      tokens: tokenString,
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_RAPIDAPI_KEY,
      'x-rapidapi-host': process.env.JUDGE0_RAPID_HOST
    }
  };

try {

let  cnt = 0;

while(true){

      const response = await axios(options);

      const results = response?.data?.submissions;
  console.log(cnt);

const allCompleted = results.every(sub =>
  sub.status && sub.status.id !== 1 && sub.status.id !== 2
);

    if (allCompleted) {

      const decodedData = {
        ...response.data,
        submissions: response.data.submissions?.map(sub => ({
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
    await new Promise(resolve => setTimeout(resolve, 2000));

  }   
}

catch (error) {
	console.error(error);
}
}

export { getLanguageId, submitBatch, submitToken, encodeBase64, decodeBase64 };
