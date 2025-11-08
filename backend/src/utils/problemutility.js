// import axios from 'axios';
// const getLanguageId = (language) => {
//     const languageMap = {
//         "python": 71,
//         "javascript": 63,
//         "java": 62,
//         "c++": 54,
//         "c": 50,
//         "ruby": 72,
//         "go": 60,
//         "swift": 83,
//         "kotlin": 78,
//         "php": 68,
//     };
//     return languageMap[language.toLowerCase()] || null;
// };

// const submitBatch = async (submissions) => {
//     const options = {
//       method: 'POST',
//       url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//       params: {
//     base64_encoded: 'false'
//   },
//   headers: {
//     'x-rapidapi-key': 'd94467d35amsh78945f81d16eeb6p108018jsnaceae07ddbce',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions
//   }
// };

// try {
// 	const response = await axios.request(options);
// 	console.log(response.data);
//     return response.data;
//   }
//   catch(err){
//     console.log("Error in submitBatch:", err);
//   }
// }





//  const submitToken =  async (submissionResultsTokens) => {
//   console.log("Submitting tokens to submitToken:", submissionResultsTokens );
//   console.log("Type of submissionResultsTokens:", typeof submissionResultsTokens );
//   const tokens1 = submissionResultsTokens.map(s => s.token);
// const tokenString = tokens1.join(",");
//   console.log("Tokens received for submitToken:", tokenString);
//   const options = {
//   method: 'GET',
//   url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//   params: {
//     tokens: [...tokenString],
//     base64_encoded: 'false',
//     fields: '*'
//   },
//   headers: {
//     'x-rapidapi-key': 'd94467d35amsh78945f81d16eeb6p108018jsnaceae07ddbce',
//     'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//   }
// };

// try {
// 	const response = await axios.request(options);
//     console.log(response.data);
// 	return response.data;
// } catch (error) {
// 	console.error(error);
// }
// }


// // while(true){
// //     const results = await submitToken(tokens);
// //     const allCompleted = results.map(submission =>
// //         submission.status && submission.status.id !== 1 && submission.status.id !== 2
// //     );
// //     if (allCompleted) {
// //         break;
// //     }
// //     await new Promise(resolve => setTimeout(resolve, 2000));
// // }


// console.log("Final results from submitToken:",submitToken);

// export { getLanguageId, submitBatch, submitToken, encodeBase64, decodeBase64 };




import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const getLanguageId = (language) => {
    if (!language) return null;
    
    // Normalize language string
    const normalized = language.toLowerCase().trim();
    
    const languageMap = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "c++": 54,
        "cpp": 54,  // Add cpp as alias for c++
        "cplusplus": 54,  // Add cplusplus as alias
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

// Helper function to encode string to base64
const encodeBase64 = (str) => {
  if (!str) return '';
  return Buffer.from(str, 'utf8').toString('base64');
};

// Helper function to decode base64 to string
const decodeBase64 = (str) => {
  if (!str) return '';
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (e) {
    return str; // Return original if decoding fails
  }
};

const submitBatch = async (submissions) => {
    // Encode source_code, stdin, and expected_output to base64
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


// const submitToken = async (submissionResultsTokens) => {
//   const tokens1 = submissionResultsTokens.map(s => s.token);
//   const tokenString = tokens1.join(",");
  
//   const options = {
//     method: 'GET',
//     url: process.env.JUDGE0_URL,
//     params: {
//       tokens: tokenString,
//       base64_encoded: 'false',
//       fields: '*'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.JUDGE0_RAPIDAPI_KEY,
//       'x-rapidapi-host': process.env.JUDGE0_RAPID_HOST
//     }
//   };

//   try {
//     let maxRetries = 10;
//     let attempt = 0;
    
//     while (attempt < maxRetries) {
//       const response = await axios(options);
      
//       const results = response?.data?.submissions;
      
//       if (!results || !Array.isArray(results)) {
//         console.log("⚠️ Submissions not ready yet, waiting 2 seconds...");
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//         attempt++;
//         continue;
//       }

//       const allCompleted = results.every(sub =>
//         sub.status && sub.status.id !== 1 && sub.status.id !== 2
//       );

//       if (allCompleted) {
//         console.log("✅ All submissions completed!");
//         return response.data;
//       }

//       console.log(`⏳ Waiting for submissions to complete... (Attempt ${attempt + 1}/${maxRetries})`);
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       attempt++;
//     }

//     console.log("⚠️ Max retries reached, returning current state");
//     return null;
   
//   } catch (error) {
//     console.error("❌ Error fetching submission results:", error);
//     throw error;
//   }
// };



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


//       console.log(response.data);

      


//       // Response.data
// //       {
// //     "message": "Submission evaluated",
// //     "finalsubmissionResults": {
// //         "submissions": [
// //             {
// //                 "source_code": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << \"Hello Judge\";\n    return 0;\n}",
// //                 "language_id": 54,
// //                 "stdin": "hkjllkhhjk",
// //                 "expected_output": "Hello Judge",
// //                 "stdout": null,
// //                 "status_id": 2,
// //                 "created_at": "2025-11-02T11:18:31.025Z",
// //                 "finished_at": null,
// //                 "time": null,
// //                 "memory": null,
// //                 "stderr": null,
// //                 "token": "2a1f45d8-3ac8-4e44-acee-efd5ecc15fe5",
// //                 "number_of_runs": 1,
// //                 "cpu_time_limit": "5.0",
// //                 "cpu_extra_time": "1.0",
// //                 "wall_time_limit": "10.0",
// //                 "memory_limit": 256000,
// //                 "stack_limit": 64000,
// //                 "max_processes_and_or_threads": 128,
// //                 "enable_per_process_and_thread_time_limit": false,
// //                 "enable_per_process_and_thread_memory_limit": false,
// //                 "max_file_size": 5120,
// //                 "compile_output": null,
// //                 "exit_code": null,
// //                 "exit_signal": null,
// //                 "message": null,
// //                 "wall_time": null,
// //                 "compiler_options": null,
// //                 "command_line_arguments": null,
// //                 "redirect_stderr_to_stdout": false,
// //                 "callback_url": null,
// //                 "additional_files": null,
// //                 "enable_network": true,
// //                 "post_execution_filesystem": null,
// //                 "status": {
// //                     "id": 2,
// //                     "description": "Processing"
// //                 },
// //                 "language": {
// //                     "id": 54,
// //                     "name": "C++ (GCC 9.2.0)"
// //                 }
// //             }
// //         ]
// //     }
// // }

let  cnt = 0;


while(true){
//     // const results = response.data;
//     //   console.log(results);
//     // // const allCompleted = results.map(submission =>
//     // //     submission.status && submission.status.id !== 1 && submission.status.id !== 2
//     // // );


      const response = await axios(options);

// // const results = response?.data?.finalsubmissionResults;
// // //  if (!results || !Array.isArray(results.submissions)) {
// // //         console.log("⚠️ Submissions not ready yet, waiting 2 seconds...");
// // //         await new Promise((resolve) => setTimeout(resolve, 2000));
// // //         continue;
// // //     }
// // const submissions = results.submissions;

// // console.log("Submissions:", submissions);

      const results = response?.data?.submissions;
  console.log(cnt);

const allCompleted = results.every(sub =>
  sub.status && sub.status.id !== 1 && sub.status.id !== 2
);

    if (allCompleted) {
      // Decode base64 responses
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


//console.log("Finaasdfasdfl asdfasdlkfhlkajsdhfkasdkjfhkasdfhkjasdhfjadlfkjhladkshfklasdhfkjlashdkjlfhkadsfhjkahdklfhkasdhflklkasdhflkaskdhfklahsjdlfkhkasdfhlk results from submitToken:",submitToken);





// while(true){
//     const submitToken = await submitTokenhelper(tokens);
//     const results = submitToken;
//     const allCompleted = results.map(submission =>
//         submission.status && submission.status.id !== 1 && submission.status.id !== 2
//     );
//     if (allCompleted) {
//         break;
//     }
//     await new Promise(resolve => setTimeout(resolve, 2000));
// }






export { getLanguageId, submitBatch, submitToken, encodeBase64, decodeBase64 };













