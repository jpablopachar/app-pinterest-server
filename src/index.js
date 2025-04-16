import express from 'express'
import morgan from 'morgan'
import { PORT } from './constants/config.js'

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(morgan('dev', ))

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})