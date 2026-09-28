import express from 'express';
import {
    createContest,
    createPersonalContest,
    deleteContest,
    getAllContests,
    getContestById,
    getContestCreationCount,
    getMyContests,
    joinContest,
    updateContest
} from '../controllers/contestController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { optionalAuthMiddleware, userMiddleware } from '../middleware/userMiddleware.js';

const contestRouter = express.Router();

contestRouter.get('/', optionalAuthMiddleware, getAllContests);
contestRouter.get('/getAllContests', optionalAuthMiddleware, getAllContests);
contestRouter.get('/contestById/:id', optionalAuthMiddleware, getContestById);
contestRouter.get('/myContests', userMiddleware, getMyContests);
contestRouter.get('/creationCount', userMiddleware, getContestCreationCount);
contestRouter.post('/join/:id', userMiddleware, joinContest);
contestRouter.post('/createPersonal', userMiddleware, createPersonalContest);

contestRouter.post('/create', adminMiddleware, createContest);
contestRouter.patch('/update/:id', adminMiddleware, updateContest);
contestRouter.delete('/delete/:id', adminMiddleware, deleteContest);
contestRouter.get('/:id', optionalAuthMiddleware, getContestById);

export default contestRouter;
