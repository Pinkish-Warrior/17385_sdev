import request from 'supertest'
import { app } from '../src/app'

// Mock fetch globally so tests never hit the real backend
const mockFetch = jest.fn()
global.fetch = mockFetch

const mockTask = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  title: 'Test task',
  description: 'A description',
  status: 'pending',
  due_date: '2026-06-01T10:00:00+00:00',
  created_at: '2026-05-14T10:00:00+00:00',
  updated_at: '2026-05-14T10:00:00+00:00',
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('GET /', () => {
  it('redirects to /tasks', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/tasks')
  })
})

describe('GET /tasks', () => {
  it('renders task list with tasks from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTask],
    })
    const res = await request(app).get('/tasks')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Test task')
    expect(res.text).toContain('Tasks')
  })

  it('renders empty state when API returns empty list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    const res = await request(app).get('/tasks')
    expect(res.status).toBe(200)
    expect(res.text).toContain('No tasks found')
  })

  it('renders error banner when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const res = await request(app).get('/tasks')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Could not load tasks')
  })
})

describe('GET /tasks/new', () => {
  it('renders create task form', async () => {
    const res = await request(app).get('/tasks/new')
    expect(res.status).toBe(200)
    expect(res.text).toContain('Create a new task')
    expect(res.text).toContain('Title')
    expect(res.text).toContain('Due date')
  })
})

describe('POST /tasks', () => {
  it('redirects to /tasks on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTask,
    })
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test task', status: 'pending', due_date: '2026-06-01T10:00' })
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/tasks')
  })

  it('re-renders form with errors on validation failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ msg: 'due_date must be in the future' }] }),
    })
    const res = await request(app)
      .post('/tasks')
      .send({ title: '', status: 'pending', due_date: '2020-01-01T10:00' })
    expect(res.status).toBe(422)
    expect(res.text).toContain('There is a problem')
  })
})

describe('GET /tasks/:id', () => {
  it('renders task detail page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockTask,
    })
    const res = await request(app).get(`/tasks/${mockTask.id}`)
    expect(res.status).toBe(200)
    expect(res.text).toContain('Test task')
    expect(res.text).toContain('Update status')
  })

  it('renders 404 page when task not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Task not found' }),
    })
    const res = await request(app).get('/tasks/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(404)
    expect(res.text).toContain('Page not found')
  })
})

describe('POST /tasks/:id', () => {
  it('redirects to /tasks on successful status update', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTask, status: 'done' }),
    })
    const res = await request(app)
      .post(`/tasks/${mockTask.id}`)
      .send({ status: 'done' })
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/tasks')
  })
})

describe('POST /tasks/:id/delete', () => {
  it('redirects to /tasks after deletion', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })
    const res = await request(app).post(`/tasks/${mockTask.id}/delete`)
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('/tasks')
  })
})

describe('GET /tasks/:id — error states', () => {
  it('renders 500 page when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const res = await request(app).get(`/tasks/${mockTask.id}`)
    expect(res.status).toBe(500)
    expect(res.text).toContain('Something went wrong')
  })
})

describe('POST /tasks/:id — error state', () => {
  it('re-renders detail page with errors on failed update', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ detail: [{ msg: 'Invalid status' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      })
    const res = await request(app)
      .post(`/tasks/${mockTask.id}`)
      .send({ status: 'invalid' })
    expect(res.status).toBe(422)
    expect(res.text).toContain('There is a problem')
  })
})
