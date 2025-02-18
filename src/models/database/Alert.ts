// src/models/database/Alert.ts
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export type AlertType = 
  | 'rage_clicking'
  | 'erratic_scrolling'
  | 'navigation_loops'
  | 'abandoned_form'
  | 'repeated_errors';

export interface Alert {
  id?: string;
  sessionId: string;
  type: AlertType;
  score: number;
  severity: number;
  timestamp: string;
  status: AlertStatus;
  createdAt: string;
}