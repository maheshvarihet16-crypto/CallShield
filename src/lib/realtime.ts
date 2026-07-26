import { EventEmitter } from "events";

// Global singleton EventEmitter for Next.js hot-reloading environment
declare global {
  // eslint-disable-next-line no-var
  var callAlertEmitter: EventEmitter | undefined;
}

export const callAlertEmitter =
  globalThis.callAlertEmitter || new EventEmitter();

// Max listeners configuration for multiple concurrent SSE client connections
callAlertEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalThis.callAlertEmitter = callAlertEmitter;
}

export interface IncomingCallEventPayload {
  id: string;
  phoneNumber: string;
  fraudScore: number;
  totalReports: number;
  topCategory?: string;
  isSpoofedFlag?: boolean;
  timestamp: string;
  source?: string;
}
