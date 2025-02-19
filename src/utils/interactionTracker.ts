import { apiClient } from '../lib/apiClient';

interface InteractionSignal {
  type: string;
  timestamp: number;
  details: any;
  sessionId: string;
  userId: string;
}

interface ClickLocation {
  x: number;
  y: number;
  timestamp: number;
}

export class InteractionTracker {
  private userId: string;
  private sessionId: string;
  private debounceMap: Map<string, number> = new Map();

  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.attachListeners();
  }

  private attachListeners() {
    // Click Tracking
    document.addEventListener('click', this.trackClickEvent.bind(this));

    // Mouse Movement Tracking (throttled)
    document.addEventListener('mousemove', this.throttle(this.trackMouseMovement.bind(this), 500));

    // Scroll Tracking (throttled)
    window.addEventListener('scroll', this.throttle(this.trackScrollEvent.bind(this), 500));

    // Keyboard Interaction
    document.addEventListener('keydown', this.trackKeyboardEvent.bind(this));

    // Error Tracking
    window.addEventListener('error', this.trackErrorEvent.bind(this));

    // Rage Clicking Detection
    this.setupRageClickDetection();
  }

  private throttle(func: Function, delay: number) {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = new Date().getTime();
      if (now - lastCall < delay) return;
      lastCall = now;
      return func(...args);
    };
  }

  private async sendInteractionSignal(signalType: string, details: any) {
    try {
      const signal: InteractionSignal = {
        type: signalType,
        timestamp: Date.now(),
        details,
        sessionId: this.sessionId,
        userId: this.userId
      };

      await apiClient.post('/interactions/track', signal);
    } catch (error) {
      console.error('Failed to send interaction signal:', error);
    }
  }

  private trackClickEvent(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const signal = {
      x: event.clientX,
      y: event.clientY,
      elementType: target.tagName,
      elementId: target.id,
      elementClass: target.className
    };

    this.sendInteractionSignal('click', signal);
  }

  private trackMouseMovement(event: MouseEvent) {
    const signal = {
      x: event.clientX,
      y: event.clientY
    };

    this.sendInteractionSignal('mouse_movement', signal);
  }

  private trackScrollEvent() {
    const signal = {
      scrollTop: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight
    };

    this.sendInteractionSignal('scroll', signal);
  }

  private trackKeyboardEvent(event: KeyboardEvent) {
    const signal = {
      key: event.key,
      keyCode: event.keyCode,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };

    this.sendInteractionSignal('keyboard', signal);
  }

  private trackErrorEvent(event: ErrorEvent) {
    const signal = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error ? event.error.stack : null
    };

    this.sendInteractionSignal('error', signal);
  }

  private setupRageClickDetection() {
    const clickThreshold = 3;     // Number of clicks
    const timeWindow = 1000;      // Milliseconds
    const clickLocations: ClickLocation[] = [];

    document.addEventListener('click', (event: MouseEvent) => {
      const now = Date.now();
      const location = { 
        x: event.clientX, 
        y: event.clientY,
        timestamp: now 
      };

      // Remove old clicks outside time window
      while (clickLocations.length > 0 && now - clickLocations[0].timestamp > timeWindow) {
        clickLocations.shift();
      }

      clickLocations.push(location);

      // Check for rage clicking
      if (clickLocations.length >= clickThreshold) {
        const areCloseClicks = clickLocations.every(
          (click) => 
            Math.abs(click.x - clickLocations[0].x) < 50 && 
            Math.abs(click.y - clickLocations[0].y) < 50
        );

        if (areCloseClicks) {
          this.sendInteractionSignal('rage_click', {
            clickCount: clickLocations.length,
            location: { x: location.x, y: location.y }
          });
        }
      }
    });
  }

  // Method to manually track custom events
  public trackCustomEvent(eventName: string, details: any) {
    this.sendInteractionSignal(eventName, details);
  }

  // Cleanup method to remove event listeners
  public cleanup() {
    document.removeEventListener('click', this.trackClickEvent);
    window.removeEventListener('mousemove', this.trackMouseMovement);
    window.removeEventListener('scroll', this.trackScrollEvent);
    document.removeEventListener('keydown', this.trackKeyboardEvent);
    window.removeEventListener('error', this.trackErrorEvent);
  }
}

// Utility function to initialize tracker
export function initInteractionTracker(userId: string, sessionId: string) {
  return new InteractionTracker(userId, sessionId);
}