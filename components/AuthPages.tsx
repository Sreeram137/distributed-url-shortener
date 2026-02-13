
import React, { useState } from 'react';
import { api } from '../services/api';

interface Props {
  onSuccess: () => void;
}

export const AuthPages: React.FC<Props> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await api.login(email, password);
      } else {
        await api.signup(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">N</div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Nexus</h1>
          </div>
        </div>

        <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            {isLogin ? "Enter your credentials to access your dashboard" : "Join the Nexus production analytics network"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-900/50 text-white px-4 py-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-900/50 text-white px-4 py-3.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
