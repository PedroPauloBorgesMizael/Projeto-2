import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, MapPin, Shield, Wrench, User as UserIcon, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper para breadcrumb e títulos das rotas
  const getPageContext = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return { title: 'Visão Geral', breadcrumb: 'Início' };
    if (path.startsWith('/tickets/new')) return { title: 'Nova Solicitação', breadcrumb: 'Chamados > Novo' };
    if (path.startsWith('/tickets/')) return { title: 'Detalhes da Solicitação', breadcrumb: 'Chamados > Detalhes' };
    if (path.startsWith('/tickets')) return { title: 'Chamados', breadcrumb: 'Gestão de Chamados' };
    if (path.startsWith('/users')) return { title: 'Usuários', breadcrumb: 'Gestão de Usuários' };
    if (path.startsWith('/auxiliary')) return { title: 'Configurações', breadcrumb: 'Tabelas Auxiliares' };
    return { title: 'HelpHome', breadcrumb: 'Painel' };
  };

  const context = getPageContext();

  const getRoleBadge = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Shield size={11} /> Admin
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wrench size={11} /> Técnico
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Shield size={11} /> Gestor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <UserIcon size={11} /> Solicitante
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Mobile Menu Button + Breadcrumb/Título */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Abrir menu de navegação"
          >
            <Menu size={22} />
          </button>

          <div className="flex flex-col">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium tracking-wide">
              <span>HelpHome</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-slate-600 font-semibold">{context.breadcrumb}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {context.title}
            </h1>
          </div>
        </div>

        {/* Lado Direito: Informações de Contexto, Ações Rápidas & Usuário */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Localização / Unidade do usuário se cadastrada */}
          {user?.location?.name && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-700">
              <MapPin size={13} className="text-blue-600" />
              <span className="truncate max-w-[140px]">{user.location.name}</span>
            </div>
          )}

          {/* Botão de Ação Rápida: Nova Solicitação (se não estiver na rota de nova) */}
          {location.pathname !== '/tickets/new' && (
            <button
              onClick={() => navigate('/tickets/new')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg shadow-xs transition-all duration-150"
            >
              <Plus size={15} />
              <span>Novo Chamado</span>
            </button>
          )}

          {/* Separador vertical sutil */}
          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Card do Usuário */}
          {user && (
            <div className="flex items-center gap-2.5 pl-1 sm:pl-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={14} />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                  {user.name}
                </span>
                <div className="mt-1">
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
