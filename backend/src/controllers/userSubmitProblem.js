import mongoose from "mongoose";
import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";
import { getLanguageId, submitBatch, submitToken } from "../utils/problemutility.js";

// Normalize language to match Submission model enum
const normalizeLanguageForDB = (lang) => {
  if (!lang) return "Python";
  const normalized = lang.toLowerCase().trim();
  
  const languageMap = {
    "python": "Python",
    "javascript": "JavaScript",
    "java": "Java",
    "cpp": "cpp",
    "c++": "c++",
    "cplusplus": "cpp",
    "c": "C",
    "ruby": "Ruby",
    "go": "Go",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "php": "PHP",
    "typescript": "TypeScript",
    "csharp": "csharp",
    "c#": "C#",
    "rust": "Rust"
  };
  
  return languageMap[normalized] || "Python";
};

const userSubmitProblem =  async (req, res) => {
   console.log("Submit result:", req.body);
  try {
      const userId = req.user._id;
      const problemId = req.params.id;
      const { language, code } = req.body;
      if (!language || !code || language.trim() === "" || code.trim() === "" || !userId) {
        return res.status(400).json({ message: "Language and code are required" });
    }
    // get the problem from the database
    const problem = await Problem.findById(problemId);
   // console.log("Fetched problem from DB:", userId, problemId, problem, language, code);
    // first are store to database to this user submission code

    // Normalize language to match database enum
    const normalizedLanguage = normalizeLanguageForDB(language);
    console.log(`Normalizing language: "${language}" -> "${normalizedLanguage}"`);

    const newSubmission = await Submission.create({
       userId,
       problemId,
      language: normalizedLanguage,
      code,
      testcasePassed: 0,
      status: "pending",
      totalTestcases: problem.hiddenTestCases.length,
    });


    const languageid = getLanguageId(language);
    if (!languageid) {
      console.error(`Unsupported language received: "${language}"`);
      return res.status(400).json({ 
        message: `Unsupported language: ${language}. Supported languages: Python, JavaScript, Java, C++, C, Ruby, Go, Swift, Kotlin, PHP, TypeScript, C#` 
      });
    }

  //   Batch submission for all hidden test cases
     
    const submissionBatch = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // console.log("Prepared submission batch for hidden test cases:", submissionBatch);

  //
  
  const submitResult = await submitBatch(submissionBatch);

  // const token = [ { token: 'e2ee4371-57db-4608-a15c-94b9946eef75' } ]
//   console.log("Tokens received from submitBatch:", token);
  console.log("Submit resulaljsd;fljklasdjf;jasdjfl");
  const finalsubmissionResults = await submitToken(submitResult);
    
// const fin = {
//   submissions: [
//     {
//       source_code: '#include <bits/stdc++.h>\n' +
//         'using namespace std;\n' +
//         '\n' +
//         'int main() {\n' +
//         '    cout << "Hello Judge";\n' +
//         '    return 0;\n' +
//         '}',
//       language_id: 54,
//       stdin: 'jhlh',
//       expected_output: 'Hello Judge',
//       stdout: null,
//       status_id: 1,
//       token: '57232083-1232-4e53-a470-28fa27bf2534',
//     }
//   ]
// };
  
//console.log("Final submission results from judge API:", finalsubmissionResults);


    // Update submission based on results
     // pid
    //  userId
    //  code
    //  language
    //total test case
    //  testCasesTotalpass
    //  status
    //  runtime
    //  memoryused
    //  errrormsg
    let testcasesPassed = 0;
    let runtime = 0;
    let memoryUsed = 0;
    let errorMsg = "";
    let overallStatus = "accepted";
    
    for(const result of finalsubmissionResults.submissions) {
        if(result.status_id === 3) {
            testcasesPassed++;
            runtime += parseFloat(result.time);
            memoryUsed += Math.max(result.memory,memoryUsed);
        }
        else {
            if(result.status_id === 4) {
                overallStatus = "error";
                errorMsg += `Testcase failed: ${result.stderr}\n`;
            }else {
                overallStatus = "pending";
         errorMsg += `Testcase failed: ${result.stderr}\n`;
            }
        }
    }

    // store the results to database
    newSubmission.testcasePassed = testcasesPassed;
    newSubmission.status = overallStatus;
    newSubmission.runTime = runtime;
    newSubmission.memoryUsed = memoryUsed;
    newSubmission.compilerErrors = errorMsg;
    await newSubmission.save();

   /// problem id insert to user schema problem solved array if not present
  // console.log("User submission updated in DB:", req.user.problemsSolved);
//    req.user.problemsSolved = req.user.problemsSolved || [];
//    console.log("User's problemsSolved array before update:", problemId, req.user.problemsSolved);
//    if (!req.user.problemsSolved.includes(problemId)) {
//        req.user.problemsSolved.push(problemId);
//        console.log("Adding problem ID to user's problemsSolved array:", problemId);
//        await req.user.save();
//        console.log("Problem ID added to user's problemsSolved array:", problemId);
//    }
// Only add to solved problems if submission is accepted
if (overallStatus === "accepted") {
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.problemsSolved = user.problemsSolved || [];
    // Convert problemId to ObjectId if it's a string
    const problemObjectId = mongoose.Types.ObjectId.isValid(problemId) 
        ? new mongoose.Types.ObjectId(problemId) 
        : problemId;
    
    // Check if problem is already in solved list (using string comparison for safety)
    const problemIdStr = problemObjectId.toString();
    const isAlreadySolved = user.problemsSolved.some(id => id.toString() === problemIdStr);
    
    if (!isAlreadySolved) {
        user.problemsSolved.push(problemObjectId);
        // Ensure uniqueness by removing any duplicates
        const uniqueIds = [];
        const seenIds = new Set();
        for (const id of user.problemsSolved) {
          const idStr = id.toString();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            uniqueIds.push(id);
          }
        }
        user.problemsSolved = uniqueIds;
        await user.save();
        console.log("Problem added to user's solved list:", problemId);
    }
}
    console.log(finalsubmissionResults);
    res.status(200).json({ message: "Submission evaluated" ,finalsubmissionResults});
  } catch (err) {
   res.status(500).json({ message: "Error evaluating submission: " + err.message  });
  }
};






















// const userSubmitProblem =  async (req,res) => {
//    try {
//       res.status(200).json({ message: "Submission evaluated"});
//    } catch (err) {
//     res.status(500).json({ message: "Error evaluating sXZcXZczxc: " + err.message });
//    }
// };

const userRunCodeOnTestCases = async (req,res) => {
   try {
      const userId = req.user._id;
      const problemId = req.params.id;
      const { language, code } = req.body;
      if (!language || !code || language.trim() === "" || code.trim() === "" || !userId) {
        return res.status(400).json({ message: "Language and code are required" });
    }
    // get the problem from the database
    const problem = await Problem.findById(problemId);
   // console.log("Fetched problem from DB:", userId, problemId, problem, language, code);
    // first are store to database to this user submission code



    const languageid = getLanguageId(language);
    if (!languageid) {
      console.error(`Unsupported language received: "${language}"`);
      return res.status(400).json({ 
        message: `Unsupported language: ${language}. Supported languages: Python, JavaScript, Java, C++, C, Ruby, Go, Swift, Kotlin, PHP, TypeScript, C#` 
      });
    }

  //   Batch submission for all visible  TestCases test case
    const submissionBatch = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // console.log("Prepared submission batch for hidden test cases:", submissionBatch);

  //
  
const submitResult = await submitBatch(submissionBatch);

  // const token = [ { token: 'e2ee4371-57db-4608-a15c-94b9946eef75' } ]
//   console.log("Tokens received from submitBatch:", token);

 const finalsubmissionResults = await submitToken(submitResult);
    
// const finalsubmissionResults = {
//   submissions: [
//     {
//       source_code: '#include <bits/stdc++.h>\n' +
//         'using namespace std;\n' +
//         '\n' +
//         'int main() {\n' +
//         '    cout << "Hello Judge";\n' +
//         '    return 0;\n' +
//         '}',
//       language_id: 54,
//       stdin: 'jhlh',
//       expected_output: 'Hello Judge',
//       stdout: null,
//       status_id: 1,
//       token: '57232083-1232-4e53-a470-28fa27bf2534',
//     }
//   ]
// };
  
//console.log("Final submission results from judge API:", finalsubmissionResults);

    res.status(200).json({ message: "Submission evaluated",  finalsubmissionResults});
  } catch (err) {
   res.status(500).json({ message: "Error evaluating submission: " + err.message });
  }
};

const userRunCustomInput = async (req, res) => {
  try {
    const userId = req.user._id;
    const { language, code, customInput } = req.body;
    
    if (!language || !code || language.trim() === "" || code.trim() === "" || !userId) {
      return res.status(400).json({ message: "Language and code are required" });
    }
    
    if (!customInput || customInput.trim() === "") {
      return res.status(400).json({ message: "Custom input is required" });
    }

    const languageid = getLanguageId(language);
    if (!languageid) {
      console.error(`Unsupported language received: "${language}"`);
      return res.status(400).json({ 
        message: `Unsupported language: ${language}. Supported languages: Python, JavaScript, Java, C++, C, Ruby, Go, Swift, Kotlin, PHP, TypeScript, C#` 
      });
    }

    // Submit single custom input
    const submissionBatch = [{
      source_code: code,
      language_id: languageid,
      stdin: customInput,
    }];

    const submitResult = await submitBatch(submissionBatch);
    const finalsubmissionResults = await submitToken(submitResult);
    
    if (finalsubmissionResults && finalsubmissionResults.submissions && finalsubmissionResults.submissions.length > 0) {
      res.status(200).json({ 
        message: "Custom input executed", 
        result: finalsubmissionResults.submissions[0]
      });
    } else {
      res.status(500).json({ message: "No result returned from execution" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error executing custom input: " + err.message });
  }
};

export { userRunCodeOnTestCases, userRunCustomInput, userSubmitProblem };

// Lists
export async function getUserSubmissions(req, res) {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const filter = { userId };
    if (req.query.problemId) filter.problemId = req.query.problemId;

    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .select("problemId language status testcasePassed totalTestcases runTime memoryUsed compilerErrors code createdAt updatedAt")
        .populate("problemId", "title difficulty"),
      Submission.countDocuments(filter),
    ]);

    res.status(200).json({ submissions: items, total, limit, offset });
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions: " + err.message });
  }
}

export async function getProblemSubmissions(req, res) {
  try {
    const problemId = req.params.id;
    const onlyMine = (req.query.user || "") === "me";
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const filter = { problemId };
    if (onlyMine) filter.userId = req.user._id;

    const [items, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .select("userId language status testcasePassed totalTestcases runTime memoryUsed compilerErrors code createdAt updatedAt")
        .populate("userId", "firstName"),
      Submission.countDocuments(filter),
    ]);

    res.status(200).json({ submissions: items, total, limit, offset });
  } catch (err) {
    res.status(500).json({ message: "Error fetching problem submissions: " + err.message });
  }
}



// import Problem from "../models/problem.js";
// import Submission from "../models/submission.js";
// import { getLanguageId, submitBatch, submitToken } from "../utils/problemutility.js";

// const userSubmitProblem = async (req, res) => {
//   try {
//     const userId = req.result._id;  // from middleware (authenticated user)
//     const problemId = req.params.id;
//     const { language, code } = req.body;

//     if (!language || !code || language.trim() === "" || code.trim() === "" || !userId) {
//       return res.status(400).json({ message: "Language and code are required" });
//     }

//     // Fetch the problem from DB
//     const problem = await Problem.findById(problemId);
//     if (!problem) {
//       return res.status(404).json({ message: "Problem not found" });
//     }

//     // Create a pending submission record
//     const newSubmission = await Submission.create({
//       user: userId,
//       problem: problemId,
//       language,
//       code,
//       testcasePassed: 0,
//       status: "Pending",
//       testCasesTotal: problem.hiddenTestCases.length,
//     });

//     const languageId = getLanguageId(language);
//     if (!languageId) {
//       return res.status(400).json({ message: `Unsupported language: ${language}` });
//     }

//     // Prepare test case batch
//     const submissionBatch = problem.hiddenTestCases.map(tc => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: tc.input,
//       expected_output: tc.output,
//     }));

//     // Send to judge API
//     const submitResult = await submitBatch(submissionBatch);
//     const finalResults = await submitToken(submitResult);

//     // Evaluate results
//     let testcasesPassed = 0;
//     let runtime = 0;
//     let memoryUsed = 0;
//     let errorMsg = "";
//     let overallStatus = "Accepted";

//     for (const result of finalResults) {
//       if (result.status_id === 3) {
//         testcasesPassed++;
//         runtime += parseFloat(result.time || 0);
//         memoryUsed = Math.max(memoryUsed, result.memory || 0);
//       } else {
//         overallStatus = "Error";
//         errorMsg += `Failed case: ${result.stderr || result.status?.description}\n`;
//       }
//     }

//     // Update DB
//     newSubmission.testcasePassed = testcasesPassed;
//     newSubmission.status = overallStatus;
//     newSubmission.runTime = runtime.toFixed(2);
//     newSubmission.memoryUsed = memoryUsed;
//     newSubmission.compilerErrors = errorMsg.trim();
//     await newSubmission.save();

//     return res.status(200).json({
//       message: "Submission evaluated successfully",
//       submission: newSubmission,
//     });
//   } catch (err) {
//     console.error("Error submitting problem:", err);
//     res.status(500).json({ message: "Error submitting problem", error: err.message });
//   }
// };

// export default userSubmitProblem;
