import { Alert, AlertType, AlertStatus } from '../models/database/Alert';
import { createClient } from '@supabase/supabase-js';

export class AlertService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async createAlert(data: {
    sessionId: string;
    score: number;
    type: string;
    timestamp: string;
  }): Promise<void> {
    const severity = this.calculateSeverity(data.score);
    const alert: Alert = {
      ...data,
      severity,
      status: 'new' as AlertStatus,
      createdAt: new Date().toISOString()
    };

    // Store in Supabase
    await this.supabase
      .from('alerts')
      .insert(alert);

    // Send notifications based on severity
    if (severity >= 8) {
      await this.notifyEngineering(alert);
    } else {
      await this.notifyProductTeam(alert);
    }
  }

  private calculateSeverity(score: number): number {
    return Math.round(score * 10);
  }

  private async notifyEngineering(alert: Alert): Promise<void> {
    // Implement Slack notification
    const message = {
      channel: 'engineering-alerts',
      text: `🚨 High Severity Frustration Detected\n
        Session ID: ${alert.sessionId}\n
        Severity: ${alert.severity}/10\n
        Type: ${alert.type}`
    };

    // Send to Slack webhook
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }

  private async notifyProductTeam(alert: Alert): Promise<void> {
    const message = {
      channel: 'product-alerts',
      text: `📊 Frustration Alert\n
        Session ID: ${alert.sessionId}\n
        Severity: ${alert.severity}/10\n
        Type: ${alert.type}`
    };

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }
}