import mongoose  from "mongoose";       
const {Schema}=mongoose;

const submissionSchema=new Schema({
    problemId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Problem",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    language:{
        type:String,
        enum:["C","c++","cpp","C++","Java","Python","JavaScript","TypeScript","Ruby","Go","Swift","Kotlin","PHP","C#","csharp","Rust"],
        required:true
    },
    code:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","running","accepted","failed"],
        default:"pending"
    },
    runTime:{
        type:Number,
        default:0
    },
    memoryUsed:{
        type:Number,
        default:0
    },
    compilerErrors:{
        type:String,
        default:""
    },
    testcasePassed:{
        type:Number,
        default:0
    },
     totalTestcases:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

// create the index to search submission by userId and problemId faster because we will often query by these fields many times
// to check how many times a user has submitted for a particular problem to logn time fetch
// example
// userid problemid
// 4 10
//6 8 
//4 9 
// 4 10
//5 7
// 4 8
// they are sort to use the index on (userid,problemid) to fetch all submissions of user 4 for problem 10 quickly
// example
// userid problemid
// 4 10
// 4 8
// 4 9
// 4 10
// 5 7
// 4 8
// they are sort to use the index on (userid,problemid) to fetch all submissions of user 4 for problem 10 quickly
// then sort problemid
// userid problemid
//  -----
// | 4 8 |
// | 4 9 |
// | 4 10 |
// | 4 10 |
// | 5 7 |
// | 6 8 |
// -----  

const Submission = mongoose.model("Submission", submissionSchema);
submissionSchema.index({ userId: 1, problemId: 1 });

export default Submission;
