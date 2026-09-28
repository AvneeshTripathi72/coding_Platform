import express from 'express'
import { optionalAuthMiddleware } from '../middleware/userMiddleware.js'
import { userSubmitProblem, userRunCodeOnTestCases, getUserSubmissions, getProblemSubmissions, userRunCustomInput } from '../controllers/userSubmitProblem.js'
const submitRouter = express.Router()

submitRouter.post('/submit/:id', optionalAuthMiddleware, userSubmitProblem);
submitRouter.post('/run/:id', optionalAuthMiddleware, userRunCodeOnTestCases);
submitRouter.post('/run-custom', optionalAuthMiddleware, userRunCustomInput);
submitRouter.get('/submissions/user', optionalAuthMiddleware, getUserSubmissions);
submitRouter.get('/submissions/problem/:id', optionalAuthMiddleware, getProblemSubmissions);

export default submitRouter
