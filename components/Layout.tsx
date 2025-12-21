
import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
          f
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">FontMinify <span className="text-indigo-600 italic">AI</span></h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Intelligent Subsetting</p>
        </div>
      </div>
      <nav className="flex items-center gap-6">
        <a href="#/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Workspace</a>
        <a href="#/history" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">My Subsets</a>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">v1.0.4-beta</div>
      </nav>
    </div>
  </header>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);
