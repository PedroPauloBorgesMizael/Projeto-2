import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Ticket,
  PlusCircle,
  Users,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wrench,
  User as UserIcon,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const role = user?.role?.toUpperCase();
  const isStaff = role === 'ADMIN' || role === 'MANAGER';
  const isTech = role === 'TECHNICIAN';

  const navItems = [
    { name: 'Chamados', path: '/tickets', icon: <Ticket size={22} /> },
    { name: 'Novo Chamado', path: '/tickets/new', icon: <PlusCircle size={22} /> },
  ];

  if (isStaff) {
    navItems.push({
      name: 'Usuários',
      path: '/users',
      icon: <Users size={22} />
    });
  }

  if (isStaff || isTech) {
    navItems.push({
      name: 'Cadastros',
      path: '/auxiliary',
      icon: <Layers size={22} />
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`bg-[#0a192f] text-white transition-all duration-300 flex flex-col z-50
          fixed md:relative inset-y-0 left-0
          ${mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden absolute right-3 top-5 text-slate-400 hover:text-white p-1"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>

        {/* Desktop Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex absolute -right-3 top-6 bg-[#0a192f] text-white p-1 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors z-10 items-center justify-center shadow-sm"
          aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Logo Area */}
        <div className="h-16 md:h-20 flex items-center justify-center border-b border-slate-700/50 px-4">
          {isOpen || mobileOpen ? (
            <img src="/logo-horizontal.png" alt="HelpHome" className="h-8 brightness-0 invert" />
          ) : (
            <img src="/logo-vertical.png" alt="HelpHome" className="h-12" />
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${!isOpen && !mobileOpen && 'md:justify-center'}`
              }
              title={!isOpen && !mobileOpen ? item.name : undefined}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {(isOpen || mobileOpen) && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area (User info & Logout) */}
        <div className="p-3 border-t border-slate-700/50 flex flex-col gap-2">
          {user && (
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/60 ${
                !isOpen && !mobileOpen && 'md:justify-center md:p-2'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
              </div>
              {(isOpen || mobileOpen) && (
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-slate-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                    {user.role === 'ADMIN' ? (
                      <span className="text-purple-400 flex items-center gap-0.5"><Shield size={10} /> Admin</span>
                    ) : user.role === 'TECHNICIAN' ? (
                      <span className="text-emerald-400 flex items-center gap-0.5"><Wrench size={10} /> Técnico</span>
                    ) : (
                      <span>{user.role}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full ${
              !isOpen && !mobileOpen && 'md:justify-center'
            }`}
            title={!isOpen && !mobileOpen ? 'Sair' : undefined}
          >
            <div className="flex-shrink-0">
              <LogOut size={20} />
            </div>
            {(isOpen || mobileOpen) && <span className="font-medium text-sm whitespace-nowrap">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
