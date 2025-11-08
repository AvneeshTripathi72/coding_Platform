import express from 'express'
import {userMiddleware,rateLimiterMiddleware} from '../middleware/userMiddleware.js'
import {userSubmitProblem,userRunCodeOnTestCases, getUserSubmissions, getProblemSubmissions, userRunCustomInput} from '../controllers/userSubmitProblem.js'
const submitRouter = express.Router()

submitRouter.post('/submit/:id', userMiddleware,userSubmitProblem);
submitRouter.post('/run/:id', userMiddleware, userRunCodeOnTestCases);
submitRouter.post('/run-custom', userMiddleware, userRunCustomInput);
submitRouter.get('/submissions/user', userMiddleware, getUserSubmissions);
submitRouter.get('/submissions/problem/:id', userMiddleware, getProblemSubmissions);


export default submitRouter
