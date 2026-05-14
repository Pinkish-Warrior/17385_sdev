import { Router, Request, Response } from 'express'
import { Task, TaskStatus, ApiError } from '../types/task'

const router = Router()
const API = process.env.BACKEND_API_URL || 'http://localhost:8000'

type PydanticError = { loc: string[]; msg: string; type: string }

function humaniseErrors(detail: ApiError['detail']): string[] {
  if (typeof detail === 'string') return [detail]

  const fieldLabels: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    status: 'Status',
    due_date: 'Due date',
  }

  return (detail as PydanticError[]).map(err => {
    const field = err.loc && err.loc.length ? err.loc[err.loc.length - 1] : ''
    const label = fieldLabels[field] || field

    if (err.type === 'missing' || err.msg === 'Field required') return `${label} is required`
    if (err.type === 'string_too_short') return `${label} is required`
    if (err.type === 'string_too_long') return `${label} must be 200 characters or fewer`
    if (err.msg.includes('future')) return 'Due date must be in the future'
    if (err.msg.includes('timezone')) return 'Due date must include a valid date and time'
    if (err.msg.includes('not a valid')) return `${label} is invalid`
    return err.msg
  })
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${API}/tasks`)
    const tasks = await response.json() as Task[]
    res.render('tasks/list.html', { tasks })
  } catch {
    res.render('tasks/list.html', { tasks: [], error: 'Could not load tasks. Please try again later.' })
  }
})

router.get('/new', (_req: Request, res: Response) => {
  res.render('tasks/new.html', { errors: null, values: {} })
})

router.post('/', async (req: Request, res: Response) => {
  const { title, description, status, due_date } = req.body
  // datetime-local inputs omit timezone — append Z to treat as UTC
  const due_date_utc = due_date ? `${due_date}:00Z` : due_date
  const response = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, status, due_date: due_date_utc }),
  })
  if (response.ok) return res.redirect('/tasks')
  const error = await response.json() as ApiError
  const errors = humaniseErrors(error.detail)
  res.status(response.status).render('tasks/new.html', { errors, values: req.body })
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API}/tasks/${req.params.id}`)
    if (response.status === 404) return res.status(404).render('errors/404.html')
    const task = await response.json() as Task
    res.render('tasks/detail.html', { task, errors: null })
  } catch {
    res.status(500).render('errors/500.html')
  }
})

router.post('/:id', async (req: Request, res: Response) => {
  const { status } = req.body
  const response = await fetch(`${API}/tasks/${req.params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: status as TaskStatus }),
  })
  if (response.ok) return res.redirect('/tasks')
  const task = await fetch(`${API}/tasks/${req.params.id}`).then(r => r.json()) as Task
  const error = await response.json() as ApiError
  const errors = humaniseErrors(error.detail)
  res.status(response.status).render('tasks/detail.html', { task, errors })
})

router.post('/:id/delete', async (req: Request, res: Response) => {
  await fetch(`${API}/tasks/${req.params.id}`, { method: 'DELETE' })
  res.redirect('/tasks')
})

export { router as taskRouter }
