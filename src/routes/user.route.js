import { Router } from 'express'
import {
  getUser,
  loginUser,
  registerUser,
} from '../controllers/user.controller.js'
import {
  validateGetUserParams,
  validateLoginRequest,
  validateUserRequest,
} from '../middlewares/user.validator.js'

export const userRouter = Router()

userRouter.post('/auth/register', validateUserRequest, registerUser)
userRouter.post('/auth/login', validateLoginRequest, loginUser)
userRouter.get('/:username', validateGetUserParams, getUser)
