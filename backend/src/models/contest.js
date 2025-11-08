import mongoose from "mongoose";
const { Schema } = mongoose;

const contestSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },

  description: {
    type: String,
    required: true,
  },

  startTime: {
    type: Date,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },

  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
  }],

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  isPublic: {
    type: Boolean,
    default: true,
  },

  status: {
    type: String,
    enum: ["upcoming", "ongoing", "ended"],
    default: "upcoming",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ creator: 1 });

const Contest = mongoose.model("Contest", contestSchema);
export default Contest;
