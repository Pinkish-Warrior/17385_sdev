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

const njkEnv = nunjucks.configure([
  path.join(__dirname, 'views'),
  path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk'),
], {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV === 'development',
})

// Enables the 2025 GOV.UK rebrand (blue header, Royal Cypher)
njkEnv.addGlobal('govukRebrand', true)

app.set('view engine', 'html')

app.get('/', (_req, res) => res.redirect('/tasks'))
app.use('/tasks', taskRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export { app }
