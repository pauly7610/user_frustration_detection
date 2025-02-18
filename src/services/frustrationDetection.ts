import { FrustrationLSTM } from '../models/ml/frustrationLSTM';
import { SignalExtractor } from '../models/ml/signalExtractor';

// Export all interfaces so they can be used in other files
export interface UserEvent {
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

export interface FrustrationEvent {
  sessionId: string;
  userId?: string;
  events: UserEvent[];
  metadata?: {
    url: string;
    userAgent: string;
    deviceType: string;
  };
}

export interface Features {
  clickFrequency: number;
  scrollJitter: number;
  inputChanges: number;
  navigationLoops: number;
  timeBetweenActions: number[];
  mouseVelocity: number;
}

export interface FrustrationScore {
  score: number;
  confidence: number;
  signals: Array<{
    type: string;
    strength: number;
  }>;
}

// Define a default features object
const defaultFeatures: Features = {
  clickFrequency: 0,
  scrollJitter: 0,
  inputChanges: 0,
  navigationLoops: 0,
  timeBetweenActions: [],
  mouseVelocity: 0
};

// Rest of the code remains the same...