import express from 'express';
import {
    deleteVideo,
    getAllVideos,
    getProblemVideos,
    getUploadToken,
    getVideo,
    incrementVideoViews,
    saveVideo,
    updateVideo,
} from '../controllers/videoController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { checkPaidUser } from '../middleware/paidUserMiddleware.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

// Get Cloudinary upload token (admin only)
router.post('/upload-token', adminMiddleware, getUploadToken);

// Save video metadata after upload (admin only)
router.post('/save', adminMiddleware, saveVideo);

// Get all videos (admin only)
router.get('/all', adminMiddleware, getAllVideos);

// Get all videos for a problem (requires paid subscription)
router.get('/problem/:problemId', userMiddleware, checkPaidUser, getProblemVideos);

// Increment video views (public - called when video starts playing)
router.post('/:videoId/increment-views', incrementVideoViews);

// Get single video (public)
router.get('/:videoId', getVideo);

// Update video (admin or video owner)
router.patch('/:videoId', userMiddleware, updateVideo);

// Delete video (admin or video owner)
router.delete('/:videoId', userMiddleware, deleteVideo);

export default router;

