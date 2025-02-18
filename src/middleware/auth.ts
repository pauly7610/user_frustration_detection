// src/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@supabase/supabase-js';
import { supabase } from '../config/database';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

type MiddlewareHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>;

export function withAuth(handler: MiddlewareHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Cast the request to include user
      (req as AuthenticatedRequest).user = user;
      
      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
}