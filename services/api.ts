
import { backend } from './backend_simulator';
import { LinkModel, Metrics, User, AuthResponse } from '../types';

const getToken = () => localStorage.getItem('nexus_token');

export const api = {
  signup: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await backend.signup(email, password);
    localStorage.setItem('nexus_token', res.token);
    return res;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await backend.login(email, password);
    localStorage.setItem('nexus_token', res.token);
    return res;
  },

  logout: () => {
    localStorage.removeItem('nexus_token');
  },

  getMe: async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;
    try {
      return await backend.getMe(token);
    } catch {
      localStorage.removeItem('nexus_token');
      return null;
    }
  },

  shorten: async (url: string): Promise<LinkModel> => {
    const token = getToken();
    if (!token) throw new Error("Not logged in");
    return await backend.shorten(url, token);
  },
  
  getMetrics: async (): Promise<Metrics> => {
    const token = getToken();
    if (!token) throw new Error("Not logged in");
    return await backend.getMetrics(token);
  },
  
  getLinks: async (): Promise<LinkModel[]> => {
    const token = getToken();
    if (!token) throw new Error("Not logged in");
    return await backend.getLinks(token);
  },
  
  simulateVisit: async (code: string): Promise<string | null> => {
    return await backend.redirect(code);
  }
};
