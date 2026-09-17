import { useEffect, useState, useTransition, type FormEvent } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  X,
  Shield,
  Wrench,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  Mail,
  User as UserIcon,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { userService } from '../../services/userService';
import { auxiliaryService } from '../../services/auxiliaryService';
import type { UserItem, UserRole, UserStatus } from '../../interface/user';
import type { LocationItem } from '../../interface/auxiliary';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

export function UserList() {
  const { user: currentUser } = useAuth();
  const [, startTransition] = useTransition();

  // Data states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'REQUESTER' as UserRole,
    locationId: ''
  });

  // Action states (Delete / Status Change)
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusActionUser, setStatusActionUser] = useState<UserItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.listUsers({
        page,
        limit: 10,
        name: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      showFeedback('error', 'Falha ao carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locs = await auxiliaryService.listLocations();
        setLocations(locs);
      } catch (err) {
        console.error('Erro ao carregar localizações:', err);
      }
    };
    loadLocations();
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      await userService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        locationId: formData.locationId || undefined
      });
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'REQUESTER', locationId: '' });
      showFeedback('success', 'Usuário cadastrado com sucesso!');
      fetchUsers();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao criar usuário. Verifique se o e-mail já está em uso.';
      setCreateError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusActionUser) return;
    try {
      setUpdatingStatus(true);
      const nextStatus: UserStatus = statusActionUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userService.changeStatus(statusActionUser.id, nextStatus);
      showFeedback('success', `Status do usuário atualizado para ${nextStatus === 'ACTIVE' ? 'Ativo' : 'Inativo'}.`);
      setStatusActionUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Não foi possível alterar o status do usuário.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await userService.deleteUser(userToDelete.id);
      showFeedback('success', 'Usuário desativado e excluído com sucesso.');
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Falha ao excluir o usuário.');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield size={13} className="text-purple-600" />
            Administrador
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Shield size={13} className="text-blue-600" />
            Gerente
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Wrench size={13} className="text-emerald-600" />
            Técnico
          </span>
        );
      case 'ASSISTANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Assistente
          </span>
        );
      case 'REQUESTER':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Solicitante
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[92%] mx-auto">
        {/* Toast feedback */}
        {feedbackMessage && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={20} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0a192f] text-white rounded-lg shadow-sm">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
                <p className="text-slate-500 text-sm">
                  Gerencie contas, permissões de acesso e status dos colaboradores e solicitantes
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="w-full sm:w-auto gap-2 px-5 py-2.5 shadow-sm"
          >
            <UserPlus size={18} />
            <span>Novo Usuário</span>
          </Button>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => {
                  startTransition(() => {
                    setSearch(e.target.value);
                    setPage(1);
                  });
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-48">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos os Perfis</option>
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="TECHNICIAN">Técnico</option>
                <option value="ASSISTANT">Assistente</option>
                <option value="REQUESTER">Solicitante</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              >
                <option value="">Todos os Status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>

            {/* Clear Button */}
            {(search || roleFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
              >
                <X size={16} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#0a192f]"></div>
              <span className="text-sm text-slate-500 font-medium">Carregando usuários...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">Nenhum usuário encontrado</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                Não localizamos nenhum registro com os filtros aplicados. Tente ajustar os parâmetros.
              </p>
              {(search || roleFilter || statusFilter) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <X size={16} />
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Perfil / Cargo</th>
                    <th className="px-6 py-4">Localização</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Criado em</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                            {getInitials(item.name || 'User')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              {item.name}
                              {item.id === currentUser?.id && (
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail size={12} className="text-slate-400" />
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(item.role)}</td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                        {item.location?.name ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                            <MapPin size={12} className="text-emerald-600" />
                            {item.location.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não vinculada</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Status Button */}
                          <button
                            onClick={() => setStatusActionUser(item)}
                            title={item.status === 'ACTIVE' ? 'Desativar Usuário' : 'Ativar Usuário'}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              item.status === 'ACTIVE'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {item.status === 'ACTIVE' ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                          {/* Soft Delete Button */}
                          {item.id !== currentUser?.id && (
                            <button
                              onClick={() => setUserToDelete(item)}
                              title="Excluir Usuário"
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 gap-4">
              <div className="text-xs text-slate-500">
                Mostrando <span className="font-semibold text-slate-700">{users.length}</span> de{' '}
                <span className="font-semibold text-slate-700">{meta.total}</span> usuários
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>
                <span className="text-xs text-slate-600 px-2 font-medium">
                  Página {page} de {meta.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Próxima
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Novo Usuário */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Novo Usuário</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha Temporária <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Perfil de Acesso <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                >
                  <option value="REQUESTER">Solicitante (Morador / Usuário Comum)</option>
                  <option value="TECHNICIAN">Técnico de Manutenção</option>
                  <option value="ASSISTANT">Assistente Administrativo</option>
                  <option value="MANAGER">Gerente Operacional</option>
                  <option value="ADMIN">Administrador Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Localização / Apartamento (Opcional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Nenhum local vinculado</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <Button type="submit" loading={creating} className="px-5">
                  Cadastrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Alternar Status */}
      {statusActionUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-3 rounded-full ${
                  statusActionUser.status === 'ACTIVE'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {statusActionUser.status === 'ACTIVE' ? <UserX size={24} /> : <UserCheck size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {statusActionUser.status === 'ACTIVE' ? 'Desativar Usuário' : 'Ativar Usuário'}
                </h3>
                <p className="text-xs text-slate-500">Alteração de acesso</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja alterar o status de{' '}
              <span className="font-semibold text-slate-800">{statusActionUser.name}</span> para{' '}
              <span className="font-semibold text-slate-800">
                {statusActionUser.status === 'ACTIVE' ? 'INATIVO' : 'ATIVO'}
              </span>
              ? {statusActionUser.status === 'ACTIVE' && 'O usuário não conseguirá acessar o sistema.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusActionUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <Button
                onClick={handleToggleStatus}
                loading={updatingStatus}
                className={`px-5 ${
                  statusActionUser.status === 'ACTIVE' ? 'bg-amber-600 hover:bg-amber-700' : ''
                }`}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão (Soft Delete) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Usuário</h3>
                <p className="text-xs text-slate-500">Ação de soft delete</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Deseja realmente remover o usuário{' '}
              <span className="font-semibold text-slate-800">{userToDelete.name}</span>? Ele será inativado e
              removido da visualização padrão, mantendo o histórico de chamados intacto.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 size={16} />
                )}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
