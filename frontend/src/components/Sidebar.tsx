import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Ticket,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Chamados', path: '/tickets', icon: <Ticket size={24} /> },
  ];

  return (
    <aside
      className={`bg-[#0a192f] text-white transition-all duration-300 flex flex-col relative ${isOpen ? 'w-64' : 'w-20'
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 bg-[#0a192f] text-white p-1 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors z-10"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700/50">
        {isOpen ? (
          <img src="/logo-horizontal.png" alt="HelpHome" className="h-8 brightness-0 invert" />
        ) : (
          <img src="/logo-vertical.png" alt="HelpHome" className="h-12" />
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${!isOpen && 'justify-center'}`
            }
            title={!isOpen ? item.name : undefined}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {isOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area (Logout) */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 px-3 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full ${!isOpen && 'justify-center'
            }`}
          title={!isOpen ? 'Sair' : undefined}
        >
          <div className="flex-shrink-0">
            <LogOut size={24} />
          </div>
          {isOpen && <span className="font-medium whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
