import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function verifyToken(req: Request, res: Response) {
  if (!process.env.JWT_SECRET) {
    res.status(500).json({ error: 'JWT_SECRET is not configured' });
    return null;
  }
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    return jwt.verify(auth.replace(/^Bearer\s+/, ''), process.env.JWT_SECRET) as jwt.JwtPayload;
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const decoded = verifyToken(req, res);
  if (!decoded) return;
  if (decoded.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  (req as any).user = decoded;
  next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const decoded = verifyToken(req, res);
  if (!decoded) return;
  (req as any).user = decoded;
  next();
}

export function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (auth && process.env.JWT_SECRET) {
    try { (req as any).user = jwt.verify(auth.replace(/^Bearer\s+/, ''), process.env.JWT_SECRET) as jwt.JwtPayload; } catch { /* anonymous guest */ }
  }
  next();
}
