import { Router, Request, Response } from 'express'
import { Task, TaskStatus } from '../types/task'

const router = Router()
const API = process.env.BACKEND_API_URL || 'http://localhost:8000'

router.get('/', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${API}/tasks`)
    const tasks: Task[] = await response.json()
    res.render('tasks/list.html', { tasks })
  } catch {
    res.render('tasks/list.html', { tasks: [], error: 'Could not load tasks.' })
  }
})

router.get('/new', (_req: Request, res: Response) => {
  res.render('tasks/new.html', { errors: null, values: {} })
})

router.post('/', async (req: Request, res: Response) => {
  const { title, description, status, due_date } = req.body
  const response = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, status, due_date }),
  })
  if (response.ok) return res.redirect('/tasks')
  const error = await response.json()
  res.status(response.status).render('tasks/new.html', { errors: error.detail, values: req.body })
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${API}/tasks/${req.params.id}`)
    if (response.status === 404) return res.status(404).render('errors/404.html')
    const task: Task = await response.json()
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
  const task = await fetch(`${API}/tasks/${req.params.id}`).then(r => r.json())
  const error = await response.json()
  res.status(response.status).render('tasks/detail.html', { task, errors: error.detail })
})

router.post('/:id/delete', async (req: Request, res: Response) => {
  await fetch(`${API}/tasks/${req.params.id}`, { method: 'DELETE' })
  res.redirect('/tasks')
})

export { router as taskRouter }
