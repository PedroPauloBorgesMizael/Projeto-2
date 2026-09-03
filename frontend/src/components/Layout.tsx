import React from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
