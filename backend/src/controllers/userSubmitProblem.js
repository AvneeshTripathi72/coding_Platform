import mongoose from "mongoose";
import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import User from "../models/user.js";
import { getLanguageId, submitBatch, submitToken } from "../utils/problemutility.js";

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

    const problem = await Problem.findById(problemId);

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

    const submissionBatch = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

  const submitResult = await submitBatch(submissionBatch);

  console.log("Submit resulaljsd;fljklasdjf;jasdjfl");
  const finalsubmissionResults = await submitToken(submitResult);
    
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

    newSubmission.testcasePassed = testcasesPassed;
    newSubmission.status = overallStatus;
    newSubmission.runTime = runtime;
    newSubmission.memoryUsed = memoryUsed;
    newSubmission.compilerErrors = errorMsg;
    await newSubmission.save();

if (overallStatus === "accepted") {
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.problemsSolved = user.problemsSolved || [];

    const problemObjectId = mongoose.Types.ObjectId.isValid(problemId) 
        ? new mongoose.Types.ObjectId(problemId) 
        : problemId;
    
    const problemIdStr = problemObjectId.toString();
    const isAlreadySolved = user.problemsSolved.some(id => id.toString() === problemIdStr);
    
    if (!isAlreadySolved) {
        user.problemsSolved.push(problemObjectId);

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

const userRunCodeOnTestCases = async (req,res) => {
   try {
      const userId = req.user._id;
      const problemId = req.params.id;
      const { language, code } = req.body;
      if (!language || !code || language.trim() === "" || code.trim() === "" || !userId) {
        return res.status(400).json({ message: "Language and code are required" });
    }

    const problem = await Problem.findById(problemId);

    const languageid = getLanguageId(language);
    if (!languageid) {
      console.error(`Unsupported language received: "${language}"`);
      return res.status(400).json({ 
        message: `Unsupported language: ${language}. Supported languages: Python, JavaScript, Java, C++, C, Ruby, Go, Swift, Kotlin, PHP, TypeScript, C#` 
      });
    }

    const submissionBatch = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageid,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

const submitResult = await submitBatch(submissionBatch);

 const finalsubmissionResults = await submitToken(submitResult);
    
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
