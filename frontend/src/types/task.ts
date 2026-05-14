export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string
  created_at: string
  updated_at: string
}

export interface TaskCreate {
  title: string
  description?: string
  status: TaskStatus
  due_date: string
}

export interface TaskUpdate {
  status: TaskStatus
}

export interface ApiError {
  detail: string | { loc: string[]; msg: string; type: string }[]
}
