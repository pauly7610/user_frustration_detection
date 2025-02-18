import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const frustrationEventSchema = z.object({
  sessionId: z.string(),
  type: z.string(),
  timestamp: z.string().datetime(),
  data: z.record(z.any())
});

export const validateFrustrationEvent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    frustrationEventSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid event data',
        details: error.errors
      });
    } else {
      res.status(500).json({ error: 'Validation failed' });
    }
  }
};