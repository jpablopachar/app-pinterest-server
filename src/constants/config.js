import dotenv from 'dotenv'

dotenv.config()

export const NODE_ENV = process.env.NODE_ENV || 'dev'
export const PORT = process.env.PORT || 3000