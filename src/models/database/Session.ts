import mongoose from 'mongoose';

export interface FrustrationEvent {
  sessionId: string;
  type: string;
  timestamp: string;
  data: any;
}

export interface SessionData {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  frustrationScore: number;
  events: FrustrationEvent[];
}

const SessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date, 
    required: false 
  },
  frustrationScore: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 10
  },
  events: [{
    sessionId: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      required: true 
    },
    timestamp: { 
      type: Date, 
      required: true 
    },
    data: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    }
  }]
}, {
  timestamps: true,
  collection: 'sessions'
});

export const Session = mongoose.model<SessionData>('Session', SessionSchema); 