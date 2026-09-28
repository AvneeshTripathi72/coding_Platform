import mongoose from "mongoose";
const {Schema}=mongoose;
const userSchema=new Schema({
    firstName:{
        type:String,
        minLength:3,
        maxLength:30,
        required:true,
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:30,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,
    },
    password:{
        type:String,
        required:false, // Password is optional for OAuth users
    },
    googleId:{
        type:String,
        sparse:true,
        unique:true,
    },
    githubId:{
        type:String,
        sparse:true,
        unique:true,
    },
    age:{
        type:Number,
        min:5,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    problemsSolved:{
        type:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Problem",
        }],
        unique:true,
        default:[],
    },
    subscription: {
        isActive: {
            type: Boolean,
            default: false,
        },
        planType: {
            type: String,
            enum: ['free', 'monthly', 'yearly'],
            default: 'free',
        },
        startDate: {
            type: Date,
            default: null,
        },
        expiryDate: {
            type: Date,
            default: null,
        },
        dodoSessionId: {
            type: String,
            default: null,
        },
        dodoPaymentId: {
            type: String,
            default: null,
        },
    },
      createdAt:{
        type:Date,
        default:Date.now,
    },

});

const User=mongoose.model('User',userSchema);
export default User;