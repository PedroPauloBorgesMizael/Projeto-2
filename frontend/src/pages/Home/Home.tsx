import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Building,
  Shield,
  PhoneCall,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

interface TicketSummary {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  slaBreached?: boolean;
  categoryRef?: { id: string; name: string };
  locationRef?: { id: string; name: string };
  technician?: { id: string; name: string };
}

interface DashboardMetrics {
  status?: {
    open: number;
    closed: number;
  };
  priorities?: Array<{ priority: string; count: number }>;
  sla?: {
    breached: number;
  };
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentTickets, setRecentTickets] = useState<TicketSummary[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Saudação de acordo com o turno do dia
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Data formatada em português brasileiro
  const getFormattedDate = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now);
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Buscar chamados recentes e métricas em paralelo
        const [ticketsRes, metricsRes] = await Promise.allSettled([
          api.get('/tickets?limit=5'),
          api.get('/metrics/dashboard'),
        ]);

        if (!isMounted) return;

        if (ticketsRes.status === 'fulfilled' && ticketsRes.value.data?.data) {
          setRecentTickets(ticketsRes.value.data.data.slice(0, 5));
        }

        if (metricsRes.status === 'fulfilled' && metricsRes.value.data) {
          setMetrics(metricsRes.value.data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      NEW: 'Novo',
      OPEN: 'Aberto',
      ASSIGNED: 'Atribuído',
      IN_PROGRESS: 'Em Andamento',
      PENDING: 'Pendente',
      RESOLVED: 'Resolvido',
      CLOSED: 'Fechado',
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ASSIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 font-semibold';
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const translatePriority = (priority: string) => {
    const map: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      CRITICAL: 'Crítica',
    };
    return map[priority] || priority;
  };

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'TECHNICIAN';

  // Cálculos de métricas seguras
  const openCount = metrics?.status?.open ?? recentTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const closedCount = metrics?.status?.closed ?? recentTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const slaAlerts = metrics?.sla?.breached ?? recentTickets.filter(t => t.slaBreached).length;

  return (
    <div className="min-h-full bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ======================================================== */}
        {/* BANNER PRINCIPAL DE BOAS-VINDAS (Humano, Elegante e Claro) */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#0a192f] text-white p-6 sm:p-8 shadow-sm border border-slate-800">
          {/* Detalhes de iluminação sutil de fundo */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Data e Badge de unidade */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
                  <Calendar size={13} className="text-blue-400" />
                  <span className="capitalize">{getFormattedDate()}</span>
                </span>
                {user?.location?.name && (
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
                    <Building size={13} className="text-emerald-400" />
                    <span>{user.location.name}</span>
                  </span>
                )}
              </div>

              {/* Título de Boas-Vindas */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {getGreeting()}, <span className="text-blue-400">{user?.name?.split(' ')[0] || 'Bem-vindo'}</span>! 👋
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Bem-vindo ao portal de chamados e suporte HelpHome. Centralize suas manutenções,
                acompanhe o status dos atendimentos e garanta o bem-estar do seu ambiente em poucos cliques.
              </p>
            </div>

            {/* Ação primária em destaque */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/tickets/new')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all duration-150"
              >
                <PlusCircle size={18} />
                <span>Abrir Nova Solicitação</span>
              </button>

              <button
                onClick={() => navigate('/tickets')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-100 font-medium text-sm border border-white/15 backdrop-blur-xs transition-all duration-150"
              >
                <span>Ver Todos os Chamados</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARDS DE RESUMO E INDICADORES (Métricas Alinhadas)       */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Chamados em Aberto */}
          <div
            onClick={() => navigate('/tickets')}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Em Andamento / Abertos
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {openCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">solicitações ativas</span>
            </div>
          </div>

          {/* Card 2: Resolvidos */}
          <div
            onClick={() => navigate('/tickets')}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolvidos & Fechados
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {closedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">finalizados</span>
            </div>
          </div>

          {/* Card 3: Alertas / SLA */}
          <div
            onClick={() => navigate('/tickets')}
            className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Atenção / Fora do Prazo
              </span>
              <div className={`p-2.5 rounded-xl ${slaAlerts > 0 ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' : 'bg-slate-50 text-slate-500'} transition-colors`}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${slaAlerts > 0 ? 'text-rose-600' : 'text-slate-900'} tracking-tight`}>
                {slaAlerts}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {slaAlerts > 0 ? 'exigem atenção' : 'todos no prazo'}
              </span>
            </div>
          </div>

          {/* Card 4: Status do Atendimento */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Operação Predial
              </span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Shield size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base font-bold text-slate-800">Equipe em Atividade</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Atendimento em horário regular</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEÇÃO PRINCIPAL (2 COLUNAS: Chamados Recentes & Apoio)   */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Coluna 1 & 2 (2/3 da largura): Chamados Recentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Solicitações Recentes</h3>
                  <p className="text-xs text-slate-500">Últimos chamados registrados no sistema</p>
                </div>
                <button
                  onClick={() => navigate('/tickets')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 p-1 hover:underline"
                >
                  <span>Ver todas</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span className="text-xs text-slate-400">Carregando solicitações...</span>
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 my-2">
                  <Inbox size={40} className="mx-auto text-slate-300 mb-3" />
                  <h4 className="text-sm font-semibold text-slate-700">Nenhum chamado aberto recentemente</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Tudo está funcionando perfeitamente! Quando notar qualquer problema ou necessidade de reparo, abra um chamado.
                  </p>
                  <Button
                    onClick={() => navigate('/tickets/new')}
                    size="sm"
                    className="mt-4"
                  >
                    <PlusCircle size={15} />
                    <span>Criar Primeiro Chamado</span>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-800 truncate">
                            {ticket.title}
                          </span>
                          {ticket.slaBreached && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                              Atrasado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          {ticket.categoryRef?.name && (
                            <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {ticket.categoryRef.name}
                            </span>
                          )}
                          {ticket.locationRef?.name && (
                            <span className="truncate max-w-[150px]">
                              {ticket.locationRef.name}
                            </span>
                          )}
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusBadge(ticket.status)}`}>
                          {translateStatus(ticket.status)}
                        </span>
                        <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-xs border ${getPriorityBadge(ticket.priority)}`}>
                          {translatePriority(ticket.priority)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {recentTickets.length > 0 && (
              <div className="pt-4 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigate('/tickets')}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Exibindo os chamados mais recentes • Clique para ver histórico completo
                </button>
              </div>
            )}
          </div>

          {/* Coluna 3 (1/3 da largura): Acesso Rápido & Guia do Condomínio */}
          <div className="space-y-6">

            {/* Card: Ações Rápidas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Acesso Rápido</h3>
              <p className="text-xs text-slate-500 mb-4">Principais atalhos do sistema</p>

              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/tickets/new')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <PlusCircle size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Solicitar Reparo</div>
                      <div className="text-[11px] text-slate-500">Problemas hidráulicos, elétricos ou outros</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  onClick={() => navigate('/tickets')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Inbox size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Histórico de Chamados</div>
                      <div className="text-[11px] text-slate-500">Filtrar por data, status ou técnico</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                {isStaff && (
                  <button
                    onClick={() => navigate('/auxiliary')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Layers size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Configurações e Tabelas</div>
                        <div className="text-[11px] text-slate-500">Gerenciar categorias, locais e equipes</div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Card: Informações Úteis & Atendimento Predial */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center gap-2 text-slate-900 mb-2">
                <PhoneCall size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold">Suporte & Emergências</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Em casos de vazamentos graves, falta total de energia ou emergências de segurança,
                entre em contato imediato com a administração do condomínio.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Horário Técnico:</span>
                  <span className="font-semibold text-slate-800">Seg a Sex • 08h às 18h</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Portaria 24h:</span>
                  <span className="font-semibold text-slate-800">Ramal 201 ou 202</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Tempo de Resposta:</span>
                  <span className="font-semibold text-emerald-600">Até 24h úteis</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
