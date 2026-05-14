import { Request, Response, NextFunction } from 'express'

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).render('errors/404.html')
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.stack)
  res.status(500).render('errors/500.html')
}
