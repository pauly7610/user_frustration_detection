import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics';

export class DashboardController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getUserFrustrationTrends(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const trends = await this.analyticsService.getUserFrustrationTrends(userId);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching frustration trends' });
    }
  }
} 