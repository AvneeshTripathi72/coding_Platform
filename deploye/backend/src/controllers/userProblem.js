import { getLanguageId, submitBatch,submitToken } from "../utils/problemutility.js";
import Problem from "../models/problem.js";
import User from "../models/user.js";
import Submission from "../models/submission.js";
const  createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags,
     visibleTestCases, hiddenTestCases,starterCode,
    referenceSolutions,problemCreator,acceptanceRate ,constraints } = req.body;

    let submission = [];
for (const { language, completeCode } of referenceSolutions) {
    const language_id = getLanguageId(language);
    if (!language_id) {
        return res.status(400).json({ message: `Unsupported language: ${language}` });
    }
    const submissionsForLang = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id,
        stdin: testcase.input,
        expected_output: testcase.output,
        cpu_time_limit: 2,
        memory_limit: 128000,
    }));

    submission.push(...submissionsForLang);
}
     
console.log("Submission batch prepared for all reference solutions and test cases:", req.body);

   const submitResult  =  await submitBatch(submission);
   console.log("Submit batch result:", submitResult);
    const finalsubmissionResults =  await submitToken(submitResult);

     await Problem.create({
     ...req.body,
     problemCreator: req._id,
   });

   res.status(201).json({ message: "Problem created successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message  + " error installing creating problem" });
    }
}

const updateProblem = async (req,res) => {

     const {id} = req.params;
     try {
      if(!id){
        return res.status(400).json({message: "Problem id is required"});
      }
      const existingProblem = await Problem.findById(id);
      if(!existingProblem){
        return res.status(404).json({message: "Problem not found"});
      }
const { title, description, difficulty, tags,
     visibleTestCases, hiddenTestCases,starterCode,
    referenceSolutions,problemCreator,acceptanceRate ,constraints } = req.body;

    let submission = [];
for (const { language, completeCode } of referenceSolutions) {
    const language_id = getLanguageId(language);
    if (!language_id) {
        return res.status(400).json({ message: `Unsupported language: ${language}` });
    }
    const submissionsForLang = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id,
        stdin: testcase.input,
        expected_output: testcase.output,
        cpu_time_limit: 2,
        memory_limit: 128000,
    }));

    submission.push(...submissionsForLang);
}
     
console.log("Submission batch prepared for all reference solutions and test cases:", req.body);

 const newProblem = await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators: true});
    
if(!newProblem){
    return res.status(500).json({message: "Problem not updated"});
}

   res.status(201).json({ message: "Problem Update successfully" });
     }
    catch(err){
        res.status(400).json({ message: err.message  + " error installing updating problem" });
    }

}

const deleteProblem = async (req,res)=>{

    const {id}= req.params;
    try{
        if(!id){
            return res.status(400).json({message: "Problem id is required"});
        }

        const existingProblem = await Problem.findById(id);
        if(!existingProblem){
            return res.status(404).json({message: "Problem not found"});
        }

        await Problem.findByIdAndDelete(id);
        res.status(200).json({message: "Problem deleted successfully"});    
    }
    catch(err){
        res.status(500).json({message: "Error deleting problem"});
    }
}

const getProblemById = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).json({message: "Problem id is required"});
        }

        const existingProblem = await Problem.findById(id)
            .select('-hiddenTestCases -problemCreator -submissions')
            .lean();
            
        if(!existingProblem){
            return res.status(404).json({message: "Problem not found"});
        }
        
        console.log('Problem fetched - has referenceSolutions:', !!existingProblem.referenceSolutions);
        console.log('ReferenceSolutions count:', existingProblem.referenceSolutions?.length || 0);
        console.log('ReferenceSolutions data:', existingProblem.referenceSolutions);
        
        if (!existingProblem.referenceSolutions) {
            existingProblem.referenceSolutions = [];
        }
        
        res.status(200).json({problem: existingProblem});
    }
    catch(err){
        res.status(500).json({message: "Error fetching problem"});
    }
}

const getProblemByIdForAdmin = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return res.status(400).json({message: "Problem id is required"});
        }

        const existingProblem = await Problem.findById(id).select('-problemCreator -submissions');
        if(!existingProblem){
            return res.status(404).json({message: "Problem not found"});
        }
        res.status(200).json({problem: existingProblem});
    }
    catch(err){
        res.status(500).json({message: "Error fetching problem"});
    }
}

const getAllProblems = async (req,res)=>{
    try{    
       const page = Math.max(parseInt(req.query.page) || 1, 1);
       const limit = Math.min(parseInt(req.query.limit) || 20, 100);
       const skip = (page - 1) * limit;

       const filter = {};

       if (req.query.difficulty) {
         filter.difficulty = new RegExp(`^${req.query.difficulty}$`, 'i');
       }

       if (req.query.tags) {
         const tags = String(req.query.tags).split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
         if (tags.length) filter.tags = { $in: tags };
       }

       if (req.query.search) {
         filter.title = { $regex: req.query.search, $options: 'i' };
       }

       const [items, total] = await Promise.all([
         Problem.find(filter)
           .select('_id title difficulty tags acceptanceRate')
           .skip(skip)
           .limit(limit),
         Problem.countDocuments(filter)
       ]);

       let solvedSet = new Set();
       if (req.user && Array.isArray(req.user.problemsSolved)) {
         solvedSet = new Set(req.user.problemsSolved.map(id => String(id)));
       }
       const problems = items.map(p => ({
         _id: p._id,
         title: p.title,
         difficulty: p.difficulty,
         tags: p.tags,
         acceptanceRate: p.acceptanceRate,
         solved: solvedSet.has(String(p._id)),
       }));

       res.status(200).json({ items: problems, total, page, limit });
    }
    catch(err){
        res.status(500).json({message: "Error fetching problems"});
    }       

}

const getTopics = async (req, res) => {
    try{
        const agg = await Problem.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])
        const topics = agg.map(a => ({ topic: a._id, count: a.count }))
        res.status(200).json({ topics })
    }catch(err){
        res.status(500).json({ message: "Error fetching topics" })
    }
}
const getAllProblemsSolvedByUser = async (req,res)=>{
    try{
       const userId = req.user._id;

       const user = await User.findById(userId).populate('problemsSolved','_id title description difficulty tags');
       if(!user){
        return res.status(404).json({message: "User not found"});
       }
       const problemsSolved = user.problemsSolved;
        res.status(200).json({problemsSolved});
    }
    catch(err){
        res.status(500).json({message: "Error fetching problems solved by user"});
    }

}

const getAllProblemsSubmittedTimesByUser = async (req,res)=>{
    try{
       const userId = req.user._id;
       const pid = req.params.pid;
       const ans = await Submission.find({user:userId,problem:pid});
       if(!user){
        return res.status(404).json({message: "User not found"});
       }
       if(ans.length===0){
        return res.status(404).json({message: "No submissions found for this problem by the user"});
       }
       res.status(200).json({problemsSubmittedTimes: ans.length, submissions: ans});
    }
    catch(err){
        res.status(500).json({message: "Error fetching problems submitted times by user"});
    }

}

export { createProblem,updateProblem,deleteProblem,getProblemById,getProblemByIdForAdmin,getAllProblems,getAllProblemsSolvedByUser,getAllProblemsSubmittedTimesByUser, getTopics }