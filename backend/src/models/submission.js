import mongoose from "mongoose";
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

const Submission = mongoose.model("Submission", submissionSchema);
submissionSchema.index({ userId: 1, problemId: 1 });

export default Submission;
