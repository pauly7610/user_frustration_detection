import { Request, Response } from 'express';
import { AlertService } from '../services/alerting';
import { supabase } from '../config/database';
import { PostgrestError } from '@supabase/supabase-js';

// Define interfaces for our data structures
interface Alert {
  id: string;
  status: 'new' | 'acknowledged' | 'resolved';
  created_at: string;
}

interface AlertUpdateBody {
  status: 'new' | 'acknowledged' | 'resolved';
}

export class AlertController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  async updateAlertStatus(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const { status } = req.body as AlertUpdateBody;

      const { data, error } = await supabase
        .from('alerts')
        .update({ status })
        .eq('id', alertId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error updating alert:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  }
}