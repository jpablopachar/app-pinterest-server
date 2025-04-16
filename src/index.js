import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'
import morgan from 'morgan'
import { CLIENT_URL, PORT } from './constants/config.js'
import { userRouter } from './routes/user.route.js'

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(cookieParser())
app.use(fileUpload())

app.use('/users', userRouter)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
