import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'

import { taskRouter } from './routes/tasks'
import { errorHandler, notFoundHandler } from './middleware/errors'

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve GOV.UK Frontend static assets
app.use('/govuk', express.static(path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk')))
app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk/assets')))

nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === 'development',
})

app.set('view engine', 'html')

app.get('/', (_req, res) => res.redirect('/tasks'))
app.use('/tasks', taskRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
