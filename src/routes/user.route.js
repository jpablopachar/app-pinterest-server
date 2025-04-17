import { Router } from 'express'
import {
  followUser,
  getUser,
  loginUser,
  registerUser,
} from '../controllers/user.controller.js'
import {
  validateGetUserParams,
  validateLoginRequest,
  validateUserRequest,
} from '../middlewares/user.validator.js'
import { verifyToken } from '../middlewares/verifyToken.validator.js'

export const userRouter = Router()

userRouter.post('/auth/register', validateUserRequest, registerUser)
userRouter.post('/auth/login', validateLoginRequest, loginUser)
userRouter.get('/:username', validateGetUserParams, getUser)
userRouter.post('/follow/:username', verifyToken, validateGetUserParams, followUser)
