import { Session } from '../models/database/Session';

export class AnalyticsService {
  async getUserFrustrationTrends(userId: string) {
    return await Session.aggregate([
      { $match: { userId } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          avgFrustrationLevel: { $avg: "$frustrationLevel" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
} 