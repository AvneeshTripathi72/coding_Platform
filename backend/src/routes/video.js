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

router.post('/upload-token', adminMiddleware, getUploadToken);

router.post('/save', adminMiddleware, saveVideo);

router.get('/all', adminMiddleware, getAllVideos);

router.get('/problem/:problemId', userMiddleware, checkPaidUser, getProblemVideos);

router.post('/:videoId/increment-views', incrementVideoViews);

router.get('/:videoId', getVideo);

router.patch('/:videoId', userMiddleware, updateVideo);

router.delete('/:videoId', userMiddleware, deleteVideo);

export default router;
