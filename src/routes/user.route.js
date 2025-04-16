import { Router } from 'express'
import { loginUser, registerUser } from '../controllers/user.controller.js'
import { validateLoginRequest, validateUserRequest } from '../middlewares/user.validator.js'

export const userRouter = Router()

userRouter.post("/auth/register", validateUserRequest, registerUser);
userRouter.post("/auth/login", validateLoginRequest, loginUser);