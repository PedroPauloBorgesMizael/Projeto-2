import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

interface Ticket {
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

interface PaginatedResponse {
  data: Ticket[];
  meta: { total: number; page: number; limit: number; totalPages: number; };
}

export function TicketList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [slaFilter, setSlaFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [locations, setLocations] = useState<{id: string, name: string}[]>([]);
  const [technicians, setTechnicians] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTickets = async () => {
      try {
        if (mounted) setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('title', search);
        if (statusFilter) params.append('status', statusFilter);
        if (priorityFilter) params.append('priority', priorityFilter);
        if (categoryFilter) params.append('categoryId', categoryFilter);
        if (locationFilter) params.append('locationId', locationFilter);
        if (technicianFilter) params.append('technicianId', technicianFilter);
        if (slaFilter) params.append('slaBreached', slaFilter);
        if (dateFrom) params.append('createdFrom', dateFrom);
        if (dateTo) params.append('createdTo', dateTo);

        const response = await api.get<PaginatedResponse>(`/tickets?${params.toString()}`);
        if (mounted) setTickets(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar solicitações', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTickets();

    return () => { mounted = false; };
  }, [search, statusFilter, priorityFilter, categoryFilter, locationFilter, technicianFilter, slaFilter, dateFrom, dateTo]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
        
        const locRes = await api.get('/locations');
        setLocations(locRes.data);

        if (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'MANAGER') {
          const techRes = await api.get('/users?role=TECHNICIAN');
          if (techRes.data.data) setTechnicians(techRes.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFilterData();
  }, [user?.role]);

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      NEW: 'Novo', OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento',
      PENDING: 'Pendente', RESOLVED: 'Resolvido', CLOSED: 'Fechado',
      ASSIGNED: 'Atribuído'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-purple-50 text-purple-700 border-purple-200',
      OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
      ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
      PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
      RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPriorityColor = (priority: string) => {
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
    const priorityMap: Record<string, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', CRITICAL: 'Crítica' };
    return priorityMap[priority] || priority;
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter('');
    setTechnicianFilter(''); setSlaFilter(''); setDateFrom(''); setDateTo('');
  };

  const activeFiltersCount = [
    statusFilter,
    priorityFilter,
    categoryFilter,
    locationFilter,
    technicianFilter,
    slaFilter,
    dateFrom,
    dateTo
  ].filter(Boolean).length;

  return (
    <div className="min-h-full bg-slate-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Minhas Solicitações</h2>
            <p className="text-sm text-slate-500">Gerencie, acompanhe e filtre seus chamados de manutenção predial</p>
          </div>
          <Button
            onClick={() => navigate('/tickets/new')}
            size="md"
            className="shrink-0"
          >
            <Plus size={18} />
            <span>Nova Solicitação</span>
          </Button>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                showFilters || activeFiltersCount > 0
                  ? 'border-blue-300 bg-blue-50/70 text-blue-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Filter size={17} />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <X size={15} />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Painel Expansível de Filtros Avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Todos os status</option>
                  <option value="UNRESOLVED">Todos Pendentes / Em Aberto</option>
                  <option value="NEW">Novo</option>
                  <option value="OPEN">Aberto</option>
                  <option value="ASSIGNED">Atribuído</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="PENDING">Pendente</option>
                  <option value="RESOLVED">Resolvido</option>
                  <option value="CLOSED">Fechado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prioridade</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Todas as prioridades</option>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Atraso no Prazo (SLA)</label>
                <select
                  value={slaFilter}
                  onChange={(e) => setSlaFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="true">Apenas Atrasados</option>
                  <option value="false">Dentro do Prazo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Localização / Unidade</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Todas as localizações</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Técnico Designado</label>
                  <select
                    value={technicianFilter}
                    onChange={(e) => setTechnicianFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Todos os técnicos</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Data Inicial</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Data Final</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabela ou Estados de Carga / Vazio */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
            <span className="text-xs text-slate-400">Carregando solicitações...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Filter size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nenhum chamado encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Não encontramos nenhuma solicitação com os critérios ou filtros selecionados. Tente ajustar a busca.
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Limpar Filtros Aplicados
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Título & Descrição</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Prioridade</th>
                    <th className="px-6 py-4">Localização</th>
                    <th className="px-6 py-4">Categoria / Técnico</th>
                    <th className="px-6 py-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {ticket.title}
                          </span>
                          {ticket.slaBreached && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md md:max-w-lg mt-0.5">
                          {ticket.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {translateStatus(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {translatePriority(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                        {ticket.locationRef?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-xs text-slate-800">{ticket.categoryRef?.name || '-'}</div>
                        <div className="text-[11px] text-slate-400">{ticket.technician?.name || 'Sem técnico'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total de solicitações: <strong>{tickets.length}</strong></span>
              <span>Clique em qualquer linha para ver detalhes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
