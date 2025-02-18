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

export class FrustrationDetectionService {
  private lstm: FrustrationLSTM;
  private signalExtractor: SignalExtractor;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    this.lstm = new FrustrationLSTM();
    this.signalExtractor = new SignalExtractor();
  }

  async processEvent(event: FrustrationEvent): Promise<FrustrationScore> {
    try {
      this.validateEvent(event);
      const features = await this.extractFeatures(event);
      const prediction = await this.detectFrustration(features);
      return this.formatResult(prediction, features);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process frustration event: ${error.message}`);
      }
      throw error;
    }
  }

  private async extractFeatures(event: FrustrationEvent): Promise<Features> {
    try {
      const extractedFeatures = await this.signalExtractor.extractFeatures({
        events: event.events,
        sessionId: event.sessionId,
        metadata: event.metadata
      });

      return {
        ...defaultFeatures,
        ...extractedFeatures
      };
    } catch (error) {
      throw new Error(`Feature extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async detectFrustration(features: Features): Promise<number> {
    try {
      const prediction = await this.lstm.predict(features);
      if (typeof prediction !== 'number') {
        throw new Error('Invalid prediction value');
      }
      return prediction;
    } catch (error) {
      throw new Error(`Frustration detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateEvent(event: FrustrationEvent): void {
    if (!event.sessionId) {
      throw new Error('Missing sessionId in event data');
    }
    if (!Array.isArray(event.events) || event.events.length === 0) {
      throw new Error('Event data must contain at least one user event');
    }
    
    event.events.forEach((userEvent, index) => {
      if (!userEvent.type || !userEvent.timestamp) {
        throw new Error(`Invalid user event at index ${index}: missing required fields`);
      }
    });
  }

  private formatResult(prediction: number, features: Features): FrustrationScore {
    const signals = this.analyzeSignals(features);
    
    return {
      score: prediction,
      confidence: this.calculateConfidence(prediction, signals),
      signals
    };
  }

  private analyzeSignals(features: Features): Array<{ type: string; strength: number; }> {
    const signals: Array<{ type: string; strength: number; }> = [];

    if (features.clickFrequency > 3) {
      signals.push({
        type: 'rage_clicking',
        strength: Math.min(features.clickFrequency / 5, 1)
      });
    }

    if (features.scrollJitter > 0.5) {
      signals.push({
        type: 'erratic_scrolling',
        strength: features.scrollJitter
      });
    }

    if (features.navigationLoops > 2) {
      signals.push({
        type: 'navigation_loops',
        strength: Math.min(features.navigationLoops / 4, 1)
      });
    }

    return signals;
  }

  private calculateConfidence(prediction: number, signals: Array<{ type: string; strength: number; }>): number {
    if (signals.length === 0) return 0.5;
    
    const signalStrengthAvg = signals.reduce((acc, signal) => acc + signal.strength, 0) / signals.length;
    const confidence = (prediction + signalStrengthAvg) / 2;
    
    return Math.min(Math.max(confidence, 0), 1);
  }
}