export interface Alert {
  id?: string;
  sessionId: string;
  severity: number;
  type: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
}