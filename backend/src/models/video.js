import mongoose from "mongoose";
const { Schema } = mongoose;

const videoSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
  },

  description: {
    type: String,
    default: "",
  },

  cloudinaryVideoId: {
    type: String,
    required: true,
    unique: true,
  },

  cloudinaryUrl: {
    type: String,
    required: true,
  },

  thumbnailUrl: {
    type: String,
    default: "",
  },

  duration: {
    type: Number, // Duration in seconds
    default: 0,
  },

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  views: {
    type: Number,
    default: 0,
  },

  isPublished: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
videoSchema.index({ problemId: 1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ createdAt: -1 });

const Video = mongoose.model("Video", videoSchema);
export default Video;

