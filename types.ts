
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface LinkModel {
  id: string;
  userId: string;
  shortCode: string;
  longUrl: string;
  createdAt: string;
  category?: string;
  clicks: number;
}

export interface AnalyticsEvent {
  id: string;
  linkId: string;
  timestamp: string;
  userAgent: string;
  referer: string;
  latencyMs: number;
}

export interface Metrics {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  avgLatency: number;
  cacheHitRate: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
