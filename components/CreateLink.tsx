
import React, { useState } from 'react';
import { api } from '../services/api';

interface Props {
  onLinkCreated: () => void;
}

export const CreateLink: React.FC<Props> = ({ onLinkCreated }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.shorten(url);
      setUrl('');
      onLinkCreated();
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 p-1.5 rounded-2xl shadow-xl border border-slate-700/50 backdrop-blur-sm group transition-all duration-300 hover:border-slate-600/50 hover:shadow-indigo-500/5">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            🔗
          </div>
          <input
            type="url"
            placeholder="Paste a long URL to shorten and categorize..."
            className="w-full bg-slate-900/50 text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Shorten URL</span>
              <span className="text-lg">⚡</span>
            </>
          )}
        </button>
      </form>
      {error && <p className="mt-3 ml-4 text-red-400 text-sm font-medium flex items-center gap-1">⚠️ {error}</p>}
    </div>
  );
};
