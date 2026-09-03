import React, { useEffect, useState } from 'react';
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
      NEW: 'bg-purple-100 text-purple-800',
      OPEN: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-amber-100 text-amber-800',
      PENDING: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-emerald-100 text-emerald-800',
      CLOSED: 'bg-slate-100 text-slate-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const translatePriority = (priority: string) => {
    const priorityMap: Record<string, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', CRITICAL: 'Crítica' };
    return priorityMap[priority] || priority;
  };

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setPriorityFilter(''); setCategoryFilter('');
    setTechnicianFilter(''); setSlaFilter(''); setDateFrom(''); setDateTo('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Minhas Solicitações</h1>
            <p className="text-slate-500">Gerencie seus chamados de manutenção</p>
          </div>
          <div className="w-full md:w-auto">
            <Button onClick={() => navigate('/tickets/new')} className="gap-2 px-6">
              <Plus size={20} />
              <span>Nova Solicitação</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Filter size={20} />
              Filtros Avançados
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Todos</option>
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
                <label className="block text-xs font-medium text-slate-500 mb-1">Prioridade</label>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Todas</option>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Atraso (SLA)</label>
                <select value={slaFilter} onChange={(e) => setSlaFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Todos</option>
                  <option value="true">Atrasados</option>
                  <option value="false">No Prazo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Localização</label>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Todas</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Técnico</label>
                  <select value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                    <option value="">Todos</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Data Inicial (Criação)</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Data Final (Criação)</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 p-2">
                  <X size={16} /> Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a192f]"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-slate-500 text-lg">Nenhuma solicitação encontrada com esses filtros.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Título</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prioridade</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Categoria / Téc</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{ticket.title}</span>
                          {ticket.slaBreached && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                              Atrasado
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {translateStatus(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {translatePriority(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {ticket.locationRef?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium text-slate-700">{ticket.categoryRef?.name || '-'}</div>
                        <div className="text-xs text-slate-500">{ticket.technician?.name || 'Sem técnico'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
