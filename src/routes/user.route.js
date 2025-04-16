import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'
import { validateUserRequest } from '../middlewares/user.validator.js'

export const userRouter = Router()

userRouter.post("/auth/register", validateUserRequest, registerUser);