import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, NODE_ENV } from '../constants/config.js'
import User from '../models/user.model.js'
import { responseReturn } from '../utils/res.util.js'

export const registerUser = async (req, res) => {
  const { username, displayName, email, password } = req.body

  if (!username || !email || !password) {
    return responseReturn(res, 400, {
      message: 'Todos los campos son requeridos!',
    })
  }

  const newHashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    displayName,
    email,
    hashedPassword: newHashedPassword,
  })

  const token = jwt.sign({ userId: user._id }, JWT_SECRET)

  res.cookie('token', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject()

  responseReturn(res, 201, detailsWithoutPassword)
}
