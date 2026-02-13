
import { LinkModel, AnalyticsEvent, Metrics, User, AuthResponse } from '../types';
import { generateShortCode } from '../utils/base62';
import { GoogleGenAI } from "@google/genai";

// Simulated DB tables
const users: Map<string, any> = new Map(); // Store { ...user, password }
const db: Map<string, LinkModel> = new Map();
const events: AnalyticsEvent[] = [];
const cache: Map<string, string> = new Map();

let cacheRequests = 0;
let cacheHits = 0;
const eventQueue: AnalyticsEvent[] = [];

// Track active sessions (Simulating JWT verification)
const sessions: Map<string, string> = new Map(); // token -> userId

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const categorizeUrl = async (url: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Categorize the following URL into a one-word category (e.g., Tech, Social, News, Education, Shopping, Other). URL: ${url}`,
      config: { maxOutputTokens: 20 }
    });
    return response.text?.trim() || 'Other';
  } catch (err) {
    return 'General';
  }
};

const startConsumer = () => {
  setInterval(() => {
    if (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (event) {
        events.push(event);
        const link = db.get(event.linkId);
        if (link) {
          link.clicks += 1;
          db.set(event.linkId, { ...link });
        }
      }
    }
  }, 100);
};
startConsumer();

export const backend = {
  // --- AUTH ENDPOINTS ---
  async signup(email: string, password: string): Promise<AuthResponse> {
    const existing = Array.from(users.values()).find(u => u.email === email);
    if (existing) throw new Error("Email already registered");

    const userId = Math.random().toString(36).substr(2, 9);
    const user: User = { id: userId, email, createdAt: new Date().toISOString() };
    users.set(userId, { ...user, password }); // In prod: hash password

    const token = btoa(`${userId}:${Date.now()}`); // Simulated JWT
    sessions.set(token, userId);
    return { user, token };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const userWithPass = Array.from(users.values()).find(u => u.email === email);
    if (!userWithPass || userWithPass.password !== password) {
      throw new Error("Invalid email or password");
    }

    const { password: _, ...user } = userWithPass;
    const token = btoa(`${user.id}:${Date.now()}`);
    sessions.set(token, user.id);
    return { user: user as User, token };
  },

  async getMe(token: string): Promise<User> {
    const userId = sessions.get(token);
    if (!userId) throw new Error("Unauthorized");
    const userWithPass = users.get(userId);
    if (!userWithPass) throw new Error("User not found");
    const { password, ...user } = userWithPass;
    return user as User;
  },

  // --- PROTECTED LINK ENDPOINTS ---
  async shorten(longUrl: string, token: string): Promise<LinkModel> {
    const userId = sessions.get(token);
    if (!userId) throw new Error("Unauthorized");

    const category = await categorizeUrl(longUrl);
    const shortCode = generateShortCode();
    const newLink: LinkModel = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      shortCode,
      longUrl,
      createdAt: new Date().toISOString(),
      category,
      clicks: 0
    };
    db.set(shortCode, newLink);
    cache.set(shortCode, longUrl);
    return newLink;
  },

  async redirect(code: string): Promise<string | null> {
    cacheRequests++;
    const start = performance.now();
    let longUrl = cache.get(code) || db.get(code)?.longUrl;
    
    if (longUrl) {
      if (cache.has(code)) cacheHits++;
      else cache.set(code, longUrl);

      const latency = performance.now() - start;
      eventQueue.push({
        id: Math.random().toString(36).substr(2, 9),
        linkId: code,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referer: 'Direct',
        latencyMs: latency
      });
      return longUrl;
    }
    return null;
  },

  async getMetrics(token: string): Promise<Metrics> {
    const userId = sessions.get(token);
    if (!userId) throw new Error("Unauthorized");

    const userLinks = Array.from(db.values()).filter(l => l.userId === userId);
    const linkIds = new Set(userLinks.map(l => l.shortCode));
    const userEvents = events.filter(e => linkIds.has(e.linkId));

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const clicksToday = userEvents.filter(e => e.timestamp.startsWith(todayStr)).length;
    const avgLatency = userEvents.length > 0 
      ? userEvents.reduce((acc, curr) => acc + curr.latencyMs, 0) / userEvents.length 
      : 0;
    
    const cacheHitRate = cacheRequests > 0 ? (cacheHits / cacheRequests) * 100 : 0;

    return {
      totalLinks: userLinks.length,
      totalClicks: userEvents.length,
      clicksToday,
      avgLatency,
      cacheHitRate
    };
  },

  async getLinks(token: string): Promise<LinkModel[]> {
    const userId = sessions.get(token);
    if (!userId) throw new Error("Unauthorized");

    return Array.from(db.values())
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
