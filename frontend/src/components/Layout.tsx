import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a192f] text-white border-b border-slate-800 z-30 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        <img src="/logo-horizontal.png" alt="HelpHome" className="h-6 brightness-0 invert" />
        <div className="w-8" />
      </header>

      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
