
import express from 'express'
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getAllProblemsSubmittedTimesByUser, getProblemById, getProblemByIdForAdmin, getTopics, updateProblem } from '../controllers/userProblem.js'
import adminMiddleware from '../middleware/adminMiddleware.js'
import { userMiddleware } from '../middleware/userMiddleware.js'
const problemRouter = express.Router()

problemRouter.post('/create', adminMiddleware,createProblem);
problemRouter.patch('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);
problemRouter.get('/admin/problemById/:id', adminMiddleware, getProblemByIdForAdmin);

problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblems', userMiddleware, getAllProblems);
problemRouter.get('/topics', userMiddleware, getTopics);
problemRouter.get('/problemSolved/user', userMiddleware, getAllProblemsSolvedByUser);
problemRouter.get('/problemSubmit/times', userMiddleware, getAllProblemsSubmittedTimesByUser);

export default problemRouter
