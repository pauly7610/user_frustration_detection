import { Request, Response } from 'express';
import { FrustrationDetectionService } from '../services/frustrationDetection';
import { supabase } from '../config/database';

// Update the interface to match the one in FrustrationDetectionService
interface UserEvent {
  type: string;
  timestamp: string;
  data: {
    elementId?: string;
    coordinates?: {
      x: number;
      y: number;
    };
    value?: string;
    scrollDelta?: number;
  };
}

interface FrustrationEvent {
  sessionId: string;
  userId?: string;
  events: UserEvent[];
  metadata?: {
    url: string;
    userAgent: string;
    deviceType: string;
  };
}

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
      // Validate and transform the request body to match FrustrationEvent
      const event = this.validateAndTransformEvent(req.body);
      await this.frustrationService.processEvent(event);
      res.status(200).json({ success: true });
    } catch (err) {
      const error = err as Error;
      console.error('Error processing frustration event:', error);
      res.status(500).json({ error: error.message || 'Failed to process event' });
    }
  }

  private validateAndTransformEvent(body: any): FrustrationEvent {
    if (!body.sessionId || !Array.isArray(body.events)) {
      throw new Error('Invalid event data: missing required fields');
    }

    // Validate each event in the events array
    const validatedEvents = body.events.map((event: any, index: number) => {
      if (!event.type || !event.timestamp) {
        throw new Error(`Invalid event at index ${index}: missing required fields`);
      }

      return {
        type: event.type,
        timestamp: event.timestamp,
        data: {
          elementId: event.data?.elementId,
          coordinates: event.data?.coordinates,
          value: event.data?.value,
          scrollDelta: event.data?.scrollDelta
        }
      };
    });

    return {
      sessionId: body.sessionId,
      userId: body.userId,
      events: validatedEvents,
      metadata: body.metadata
    };
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