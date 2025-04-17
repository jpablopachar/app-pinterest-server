/* eslint-disable no-undef */

import dotenv from 'dotenv'

dotenv.config()

export const NODE_ENV = process.env.NODE_ENV || 'dev'
export const PORT = process.env.PORT || 3000
export const DB_URL = process.env.DB_URL || ''
export const JWT_SECRET = process.env.JWT_SECRET || ''
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'