import { Request, Response } from 'express';
import { AlertService } from '../services/alerting';
import { supabase } from '../config/database';

export class AlertController {
  private alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  getAlerts(req: Request, res: Response) {
    try {
      supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (error) throw error;
          res.status(200).json(data);
        })
        .catch((error) => {
          console.error('Error fetching alerts:', error);
          res.status(500).json({ error: 'Failed to fetch alerts' });
        });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  updateAlertStatus(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const { status } = req.body;

      supabase
        .from('alerts')
        .update({ status })
        .eq('id', alertId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          res.status(200).json(data);
        })
        .catch((error) => {
          console.error('Error updating alert:', error);
          res.status(500).json({ error: 'Failed to update alert' });
        });
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  }
}