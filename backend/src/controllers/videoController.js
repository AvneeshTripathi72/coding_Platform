import cloudinary from '../config/cloudinary.js';
import Problem from '../models/problem.js';
import Video from '../models/video.js';

// Get Cloudinary upload signature/token for frontend direct upload
export const getUploadToken = async (req, res) => {
  try {
    console.log('=== getUploadToken called ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { problemId } = req.body;
    
    if (!problemId) {
      console.error('[Error] Problem ID missing');
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    console.log('Problem ID:', problemId);

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('[Error] Problem not found:', problemId);
      return res.status(404).json({ message: 'Problem not found' });
    }
    console.log('Problem found:', problem.title);

    // Generate upload preset (you can create a preset in Cloudinary dashboard)
    // For now, we'll use unsigned upload with folder structure
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `code-arena/problems/${problemId}/videos`;
    
    // Generate signature for unsigned upload (if using unsigned preset)
    // Or return the preset name if using unsigned preset
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'code_arena_videos';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    console.log('Cloudinary configuration:', {
      uploadPreset,
      cloudName: cloudName ? 'configured' : 'MISSING',
      folder,
      timestamp
    });
    
    if (!cloudName) {
      console.error('[Error] CLOUDINARY_CLOUD_NAME not set in environment variables');
    }
    if (!uploadPreset) {
      console.error('[Error] CLOUDINARY_UPLOAD_PRESET not set in environment variables');
    }
    
    const responseData = {
      uploadPreset,
      folder,
      resourceType: 'video',
      timestamp,
      cloudName: cloudName,
    };
    
    console.log('Sending upload token response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('=== Error generating upload token ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error generating upload token', error: error.message });
  }
};

// Save video metadata after Cloudinary upload
export const saveVideo = async (req, res) => {
  try {
    console.log('=== saveVideo called ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { problemId, title, description, cloudinaryVideoId, cloudinaryUrl, thumbnailUrl, duration } = req.body;
    const userId = req.user._id || req.user.userId;

    console.log('Extracted data:', {
      problemId,
      title,
      cloudinaryVideoId,
      cloudinaryUrl,
      userId
    });

    if (!problemId || !title || !cloudinaryVideoId || !cloudinaryUrl) {
      console.error('[Error] Missing required fields');
      return res.status(400).json({ 
        message: 'Problem ID, title, Cloudinary video ID, and URL are required' 
      });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('[Error] Problem not found:', problemId);
      return res.status(404).json({ message: 'Problem not found' });
    }
    console.log('Problem found:', problem.title);

    const video = new Video({
      title,
      description: description || '',
      cloudinaryVideoId,
      cloudinaryUrl,
      thumbnailUrl: thumbnailUrl || '',
      duration: duration || 0,
      problemId,
      uploadedBy: userId,
      views: 0,
      isPublished: true,
    });

    console.log('Saving video to database...');
    await video.save();
    console.log('Video saved successfully:', video._id);

    res.status(201).json({
      message: 'Video saved successfully',
      video,
    });
  } catch (error) {
    console.error('=== Error saving video ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Video with this Cloudinary ID already exists' });
    }
    res.status(500).json({ message: 'Error saving video', error: error.message });
  }
};

// Get all videos (admin only)
export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('uploadedBy', 'firstName lastName emailId')
        .populate('problemId', 'title difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(query)
    ]);

    res.json({
      message: 'Videos retrieved successfully',
      videos,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Get all videos for a problem
export const getProblemVideos = async (req, res) => {
  try {
    const { problemId } = req.params;

    const videos = await Video.find({ problemId, isPublished: true })
      .populate('uploadedBy', 'firstName lastName emailId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Videos retrieved successfully',
      videos,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Increment video views (called when video starts playing)
export const incrementVideoViews = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({
      message: 'Views incremented successfully',
      views: video.views,
    });
  } catch (error) {
    console.error('Error incrementing video views:', error);
    res.status(500).json({ message: 'Error incrementing views', error: error.message });
  }
};

// Get single video
export const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate('uploadedBy', 'firstName lastName emailId')
      .populate('problemId', 'title difficulty');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({
      message: 'Video retrieved successfully',
      video,
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;
    const userId = req.user._id || req.user.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the uploader or admin
    if (video.uploadedBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this video' });
    }

    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (isPublished !== undefined) video.isPublished = isPublished;
    video.updatedAt = new Date();

    await video.save();

    res.json({
      message: 'Video updated successfully',
      video,
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id || req.user.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user is the uploader or admin
    if (video.uploadedBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this video' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(video.cloudinaryVideoId, { resource_type: 'video' });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    await Video.findByIdAndDelete(videoId);

    res.json({
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};

