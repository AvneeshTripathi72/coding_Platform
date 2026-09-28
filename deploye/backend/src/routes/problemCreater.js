
import express from 'express';
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getAllProblemsSubmittedTimesByUser, getProblemById, getProblemByIdForAdmin, getTopics, updateProblem } from '../controllers/userProblem.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { optionalAuthMiddleware, userMiddleware } from '../middleware/userMiddleware.js';

const problemRouter = express.Router();

problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.patch('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);
problemRouter.get('/admin/problemById/:id', adminMiddleware, getProblemByIdForAdmin);

// Problem read routes supporting both standard REST (/ & /:id) and legacy paths (/getAllProblems, /problemById/:id)
problemRouter.get('/', optionalAuthMiddleware, getAllProblems);
problemRouter.get('/getAllProblems', optionalAuthMiddleware, getAllProblems);
problemRouter.get('/topics', optionalAuthMiddleware, getTopics);
problemRouter.get('/problemById/:id', optionalAuthMiddleware, getProblemById);
problemRouter.get('/problemSolved/user', userMiddleware, getAllProblemsSolvedByUser);
problemRouter.get('/problemSubmit/times', userMiddleware, getAllProblemsSubmittedTimesByUser);
problemRouter.get('/:id', optionalAuthMiddleware, getProblemById);

export default problemRouter;
