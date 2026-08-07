import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    (req as any).user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
