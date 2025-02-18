import { Request, Response } from 'express';
import { FrustrationDetectionService } from '../services/frustrationDetection';
import { supabase } from '../config/database';

// Add an interface for the event data
interface FrustrationEvent {
  sessionId: string;
  type: string;
  timestamp: string;
  data: any;
}

// Add a custom error type
interface ServiceError {
  message: string;
  code?: string;
}

export class SessionController {
  private frustrationService: FrustrationDetectionService;

  constructor() {
    this.frustrationService = new FrustrationDetectionService();
  }

  async handleEvent(req: Request, res: Response) {
    try {
      const event = req.body as FrustrationEvent;
      await this.frustrationService.processEvent(event);
      res.status(200).json({ success: true });
    } catch (err) {
      const error = err as Error;
      console.error('Error processing frustration event:', error);
      res.status(500).json({ error: error.message || 'Failed to process event' });
    }
  }

  async getSessionData(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      res.status(200).json(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching session data:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch session data' });
    }
  }
}