import React, { useState, useEffect } from 'react';
import { CreateLink } from './components/CreateLink';
import { Dashboard } from './components/Dashboard';
import { AuthPages } from './components/AuthPages';
import { api } from './services/api';
import { User } from './types';

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [linkNotFound, setLinkNotFound] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      // Check for query parameter based redirect (?code=...)
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        setRedirecting(true);
        try {
          const longUrl = await api.simulateVisit(code);
          if (longUrl) {
            // Success: Navigate away
            window.location.replace(longUrl);
            return;
          } else {
            setLinkNotFound(true);
            setRedirecting(false);
          }
        } catch (err) {
          console.error("Redirect failed:", err);
          setLinkNotFound(true);
          setRedirecting(false);
        }
      } else {
        // No code param: Check user session
        const u = await api.getMe();
        setUser(u);
        setAuthChecked(true);
      }
    };

    handleNavigation();
  }, []);

  const handleLinkCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setShowDropdown(false);
  };

  // UI for Link Not Found state
  if (linkNotFound) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-5xl mb-6 border border-rose-500/20">
          🚫
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Link Not Found</h1>
        <p className="text-slate-400 max-w-md mb-8">
          The link you're trying to access might have expired, been deleted, or the code is simply incorrect.
        </p>
        <button 
          onClick={() => {
            // Remove code from URL and reset state
            window.history.replaceState({}, '', window.location.pathname);
            setLinkNotFound(false);
            // After clearing, re-run auth check
            api.getMe().then(u => {
              setUser(u);
              setAuthChecked(true);
            });
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // UI for Redirecting state
  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center space-y-6 p-6">
        <div className="relative">
          <div className="h-20 w-20 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 h-20 w-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-white mb-1">Redirecting...</p>
          <p className="text-slate-400 text-sm tracking-wide">Nexus high-speed relay in progress</p>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPages onSuccess={() => api.getMe().then(setUser)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)]">N</div>
          <span className="text-xl font-bold tracking-tight">Nexus</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon="📊" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon="🔗" label="My Links" active={activeTab === 'links'} onClick={() => setActiveTab('links')} />
          <NavItem icon="📈" label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Core: Ready
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Relay: 24ms
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Environment:</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">SECURE LIVE</span>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold">{user.email.split('@')[0]}</span>
              <span className="text-xs text-slate-500">ID: {user.id.slice(0, 6)}</span>
            </div>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center hover:border-indigo-500 transition-colors shadow-inner"
            >
              👤
            </button>
            
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/30">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Authenticated as</p>
                  <p className="text-xs truncate font-medium text-slate-200">{user.email}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-bold flex items-center gap-3"
                  >
                    <span>🚪</span>
                    Logout Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full space-y-12">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Nexus Dashboard</h1>
              <p className="text-slate-400 mt-2 text-lg">Centralized control for your production URL infrastructure.</p>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Shorten & Categorize</h2>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            <CreateLink onLinkCreated={handleLinkCreated} />
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Analytics Insights</h2>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            <Dashboard refreshTrigger={refreshTrigger} />
          </section>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
    }`}
  >
    <span className="text-xl opacity-90">{icon}</span>
    {label}
  </button>
);

export default App;