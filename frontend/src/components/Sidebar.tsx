import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
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
    { name: 'Início', path: '/home', icon: <HomeIcon size={20} /> },
    { name: 'Chamados', path: '/tickets', icon: <Ticket size={20} /> },
    { name: 'Novo Chamado', path: '/tickets/new', icon: <PlusCircle size={20} /> },
  ];

  if (isStaff) {
    navItems.push({
      name: 'Usuários',
      path: '/users',
      icon: <Users size={20} />,
    });
  }

  if (isStaff || isTech) {
    navItems.push({
      name: 'Configurações',
      path: '/auxiliary',
      icon: <Layers size={20} />,
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col z-50
          fixed md:relative inset-y-0 left-0 border-r border-slate-800
          ${mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden absolute right-3 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>

        {/* Desktop Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex absolute -right-3.5 top-6 bg-slate-800 text-slate-200 p-1.5 rounded-full border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors z-20 items-center justify-center shadow-md cursor-pointer"
          aria-label={isOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Brand / Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4 shrink-0">
          <div
            onClick={() => navigate('/home')}
            className="cursor-pointer flex items-center justify-center transition-opacity hover:opacity-90"
          >
            {isOpen || mobileOpen ? (
              <img src="/logo-horizontal.png" alt="HelpHome" className="h-7 brightness-0 invert object-contain" />
            ) : (
              <img src="/logo-vertical.png" alt="HelpHome" className="h-9 object-contain" />
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              end={item.path === '/home'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${!isOpen && !mobileOpen ? 'md:justify-center md:px-0' : ''}`
              }
              title={!isOpen && !mobileOpen ? item.name : undefined}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </div>
              {(isOpen || mobileOpen) && (
                <span className="whitespace-nowrap truncate">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area (User summary & Logout) */}
        <div className="p-3 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          {user && (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-800 ${
                !isOpen && !mobileOpen ? 'md:justify-center md:px-0 md:py-2' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
              </div>
              {(isOpen || mobileOpen) && (
                <div className="overflow-hidden flex-1">
                  <div className="font-semibold text-xs text-slate-100 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                    {user.role === 'ADMIN' ? (
                      <span className="text-purple-400 flex items-center gap-1 font-medium">
                        <Shield size={10} /> Administrador
                      </span>
                    ) : user.role === 'TECHNICIAN' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        <Wrench size={10} /> Técnico
                      </span>
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors w-full cursor-pointer ${
              !isOpen && !mobileOpen ? 'md:justify-center md:px-0' : ''
            }`}
            title={!isOpen && !mobileOpen ? 'Sair da conta' : undefined}
          >
            <div className="flex-shrink-0 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            {(isOpen || mobileOpen) && <span className="whitespace-nowrap">Encerrar Sessão</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
