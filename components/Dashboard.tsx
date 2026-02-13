import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Metrics, LinkModel } from '../types';

interface Props {
  refreshTrigger: number;
}

export const Dashboard: React.FC<Props> = ({ refreshTrigger }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [links, setLinks] = useState<LinkModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [m, l] = await Promise.all([api.getMetrics(), api.getLinks()]);
      setMetrics(m);
      setLinks(l);
    } catch (err) {
      console.error("Dashboard failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Links" value={metrics?.totalLinks || 0} icon="🔗" color="indigo" />
        <StatCard label="Total Clicks" value={metrics?.totalClicks || 0} icon="📈" color="emerald" />
        <StatCard label="Avg Latency" value={`${metrics?.avgLatency.toFixed(1)}ms`} icon="⚡" color="amber" />
        <StatCard label="Cache Rate" value={`${metrics?.cacheHitRate.toFixed(1)}%`} icon="💾" color="blue" />
      </div>

      {/* Links Table */}
      <div className="bg-slate-800/20 rounded-3xl border border-slate-800/50 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-900/20">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Link Identity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Analytics</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-indigo-400 font-mono text-sm font-bold tracking-tight">
                        {window.location.hostname}/?code={link.shortCode}
                      </span>
                      <span className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-xs mt-1">
                        {link.longUrl}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                      {link.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-slate-300">{link.clicks} Clicks</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => copyToClipboard(link.shortCode)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        copiedId === link.shortCode 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50'
                      }`}
                    >
                      {copiedId === link.shortCode ? 'Copied!' : 'Copy Link'}
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    No links found. Create your first short link above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl shadow-lg hover:border-slate-600 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${colorMap[color]}`}>
          Realtime
        </div>
      </div>
      <p className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};
