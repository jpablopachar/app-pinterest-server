import { Router } from 'express'
import { registerUser } from '../controllers/user.controller.js'

export const userRouter = Router()

userRouter.post("/auth/register", registerUser);