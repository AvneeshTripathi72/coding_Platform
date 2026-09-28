import mongoose from "mongoose";
const { Schema } = mongoose;

const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxLength: 100,
  },

  description: {
    type: String,
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },

  tags: {
    type: [String],
    default: [],
  },

  visibleTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String },
    },
  ],

  hiddenTestCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],

  starterCode: [
    {
      language: { type: String, required: true },
      initialCode: { type: String, required: true },
    },
  ],

  constraints: {
    type: [String],
    default: [],
  },

  acceptanceRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },

  submissions: {
    type: Number,
    default: 0,
  },

  successfulSubmissions: {
    type: Number,
    default: 0,
  },

  problemCreator: {
    type: mongoose.Schema.Types.ObjectId,
  },
  referenceSolutions: [
    {
      language: { type: String, required: true },
      completeCode: { type: String, required: true },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;
