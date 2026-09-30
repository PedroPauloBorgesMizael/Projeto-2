import { useEffect, useState, useTransition, type FormEvent } from 'react';
import {
  FolderTree,
  MapPin,
  Users2,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Shield,
  Wrench,
  CheckSquare,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { auxiliaryService } from '../../services/auxiliaryService';
import { userService } from '../../services/userService';
import { approvalService } from '../../services/approvalService';
import type { CategoryItem, LocationItem, TeamItem } from '../../interface/auxiliary';
import type { UserItem } from '../../interface/user';
import type { ApprovalTypeItem } from '../../interface/approval';
import { Button } from '../../components/Button';

type ActiveTab = 'categories' | 'locations' | 'teams' | 'approvals';

export function AuxiliarySettings() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [, startTransition] = useTransition();

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [approvalTypes, setApprovalTypes] = useState<ApprovalTypeItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  // Modal states for Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
    memberIds: [] as string[]
  });

  // Modal states for Edit Approval Type
  const [isEditTypeOpen, setIsEditTypeOpen] = useState(false);
  const [editingType, setEditingType] = useState<ApprovalTypeItem | null>(null);
  const [editTypeForm, setEditTypeForm] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [savingEditType, setSavingEditType] = useState(false);
  const [editTypeError, setEditTypeError] = useState('');

  // Modal states for Manage Team Members
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [savingMembers, setSavingMembers] = useState(false);
  const [manageMembersError, setManageMembersError] = useState('');

  // Feedback Toast
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [catRes, locRes, teamRes, typesRes, usersRes] = await Promise.all([
        auxiliaryService.listCategories(),
        auxiliaryService.listLocations(),
        auxiliaryService.listTeams(),
        approvalService.listApprovalTypes(),
        userService.listUsers({ limit: 200 })
      ]);
      setCategories(catRes);
      setLocations(locRes);
      setTeams(teamRes);
      setApprovalTypes(typesRes);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
      showFeedback('error', 'Não foi possível carregar os cadastros auxiliares.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenModal = () => {
    setFormData({ name: '', description: '', parentId: '', isActive: true, memberIds: [] });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);

    try {
      if (activeTab === 'categories') {
        await auxiliaryService.createCategory({
          name: formData.name,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined
        });
        showFeedback('success', 'Categoria cadastrada com sucesso!');
      } else if (activeTab === 'locations') {
        await auxiliaryService.createLocation({
          name: formData.name,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined
        });
        showFeedback('success', 'Localização cadastrada com sucesso!');
      } else if (activeTab === 'teams') {
        await auxiliaryService.createTeam({
          name: formData.name,
          description: formData.description || undefined,
          memberIds: formData.memberIds
        });
        showFeedback('success', 'Equipe cadastrada com sucesso!');
      } else if (activeTab === 'approvals') {
        await approvalService.createApprovalType({
          name: formData.name,
          description: formData.description || undefined,
          isActive: formData.isActive
        });
        showFeedback('success', 'Tipo de aprovação cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao salvar registro. Verifique os dados e tente novamente.';
      setModalError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditType = (typeItem: ApprovalTypeItem) => {
    setEditingType(typeItem);
    setEditTypeForm({
      name: typeItem.name,
      description: typeItem.description || '',
      isActive: typeItem.isActive
    });
    setEditTypeError('');
    setIsEditTypeOpen(true);
  };

  const handleEditTypeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setEditTypeError('');
    setSavingEditType(true);

    try {
      await approvalService.updateApprovalType(editingType.id, {
        name: editTypeForm.name,
        description: editTypeForm.description || undefined,
        isActive: editTypeForm.isActive
      });
      showFeedback('success', 'Tipo de aprovação atualizado com sucesso!');
      setIsEditTypeOpen(false);
      loadAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao atualizar tipo de aprovação.';
      setEditTypeError(errorMsg);
    } finally {
      setSavingEditType(false);
    }
  };

  const handleDeleteType = async (typeItem: ApprovalTypeItem) => {
    if (!window.confirm(`Deseja realmente desativar/excluir o tipo de aprovação "${typeItem.name}"?`)) return;
    try {
      await approvalService.deleteApprovalType(typeItem.id);
      showFeedback('success', 'Tipo de aprovação removido/desativado com sucesso.');
      loadAllData();
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Falha ao remover o tipo de aprovação.');
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await approvalService.seedDefaultTypes();
      showFeedback('success', 'Tipos padrão sincronizados com sucesso!');
      loadAllData();
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Falha ao sincronizar tipos padrão.');
    }
  };

  const handleOpenManageMembers = (team: TeamItem) => {
    setSelectedTeam(team);
    setTeamMemberIds(team.members?.map((m) => m.id) || []);
    setMemberSearch('');
    setManageMembersError('');
    setIsManageMembersOpen(true);
  };

  const handleToggleMember = (userId: string) => {
    setTeamMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveMembers = async () => {
    if (!selectedTeam) return;
    setSavingMembers(true);
    setManageMembersError('');

    try {
      await auxiliaryService.updateTeamMembers(selectedTeam.id, teamMemberIds);
      showFeedback('success', 'Membros da equipe atualizados com sucesso!');
      setIsManageMembersOpen(false);
      loadAllData();
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao salvar membros da equipe.';
      setManageMembersError(errorMsg);
    } finally {
      setSavingMembers(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
            <Shield size={10} />
            Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
            <Shield size={10} />
            Gerente
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
            <Wrench size={10} />
            Técnico
          </span>
        );
      case 'ASSISTANT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
            Assistente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
            Solicitante
          </span>
        );
    }
  };

  // Filtered lists
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredApprovals = approvalTypes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.description && a.description.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredUsersForModal = users.filter(
    (u) =>
      u.status === 'ACTIVE' &&
      (u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[92%] mx-auto">
        {/* Toast Feedback */}
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
            <p className="text-sm font-semibold">{feedbackMessage.text}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Cadastros Auxiliares</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie categorias, localizações, equipes e tipos de aprovação do Help Home.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'approvals' && (
              <button
                onClick={handleSeedDefaults}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                title="Restaurar / carregar tipos padrão de aprovação"
              >
                <RotateCcw size={14} />
                <span>Restaurar Padrões</span>
              </button>
            )}
            <Button onClick={handleOpenModal} className="gap-2 shadow-sm">
              <Plus size={18} />
              <span>
                {activeTab === 'categories' && 'Nova Categoria'}
                {activeTab === 'locations' && 'Nova Localização'}
                {activeTab === 'teams' && 'Nova Equipe'}
                {activeTab === 'approvals' && 'Novo Tipo de Aprovação'}
              </span>
            </Button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setActiveTab('categories')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              activeTab === 'categories'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categorias</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FolderTree size={24} />
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('locations')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              activeTab === 'locations'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Localizações</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{locations.length}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <MapPin size={24} />
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('teams')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              activeTab === 'teams'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipes de Suporte</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{teams.length}</h3>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users2 size={24} />
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('approvals')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              activeTab === 'approvals'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipos de Aprovação</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{approvalTypes.length}</h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <CheckSquare size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => {
              setActiveTab('categories');
              setSearch('');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree size={18} />
            <span>Categorias ({categories.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('locations');
              setSearch('');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'locations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin size={18} />
            <span>Localizações ({locations.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('teams');
              setSearch('');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users2 size={18} />
            <span>Equipes ({teams.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('approvals');
              setSearch('');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${
              activeTab === 'approvals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare size={18} />
            <span>Tipos de Aprovação ({approvalTypes.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Filtrar ${
                activeTab === 'categories'
                  ? 'categorias'
                  : activeTab === 'locations'
                  ? 'localizações'
                  : activeTab === 'teams'
                  ? 'equipes'
                  : 'tipos de aprovação'
              }...`}
              value={search}
              onChange={(e) => {
                startTransition(() => {
                  setSearch(e.target.value);
                });
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#0a192f]"></div>
              <span className="text-sm text-slate-500 font-medium">Carregando dados...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: CATEGORIAS */}
              {activeTab === 'categories' && (
                filteredCategories.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <FolderTree size={36} className="mx-auto text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-700">Nenhuma categoria encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="px-6 py-4">Nome da Categoria</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Categoria Pai</th>
                        <th className="px-6 py-4">Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredCategories.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                            <FolderTree size={16} className="text-blue-600 flex-shrink-0" />
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.description || <span className="text-slate-400 italic">Sem descrição</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.parent?.name ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                                {item.parent.name}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* TAB 2: LOCALIZAÇÕES */}
              {activeTab === 'locations' && (
                filteredLocations.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <MapPin size={36} className="mx-auto text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-700">Nenhuma localização encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="px-6 py-4">Nome do Local / Apartamento</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Local Pai / Bloco</th>
                        <th className="px-6 py-4">Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredLocations.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-600 flex-shrink-0" />
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.description || <span className="text-slate-400 italic">Sem descrição</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.parent?.name ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                                {item.parent.name}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* TAB 3: EQUIPES */}
              {activeTab === 'teams' && (
                filteredTeams.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Users2 size={36} className="mx-auto text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-700">Nenhuma equipe encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="px-6 py-4">Nome da Equipe</th>
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Membros Vinculados</th>
                        <th className="px-6 py-4">Cadastrado em</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTeams.map((item) => {
                        const members = item.members || [];
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                              <Briefcase size={16} className="text-purple-600 flex-shrink-0" />
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">
                              {item.description || <span className="text-slate-400 italic">Sem descrição</span>}
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {members.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mr-1">
                                    {members.length} {members.length === 1 ? 'membro' : 'membros'}
                                  </span>
                                  {members.slice(0, 3).map((m) => (
                                    <span
                                      key={m.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                                      title={`${m.name} (${m.email})`}
                                    >
                                      {m.name}
                                    </span>
                                  ))}
                                  {members.length > 3 && (
                                    <span className="text-slate-400 font-medium text-[11px] self-center">
                                      +{members.length - 3} mais
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Nenhum membro vinculado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleOpenManageMembers(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                                title="Vincular ou desvincular membros desta equipe"
                              >
                                <Users2 size={14} />
                                <span>Gerenciar Membros</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}

              {/* TAB 4: TIPOS DE APROVAÇÃO */}
              {activeTab === 'approvals' && (
                filteredApprovals.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <CheckSquare size={36} className="mx-auto text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-700">Nenhum tipo de aprovação cadastrado.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clique no botão "Restaurar Padrões" acima ou crie um novo tipo personalizado.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="px-6 py-4">Tipo de Aprovação</th>
                        <th className="px-6 py-4">Descrição / Finalidade</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Cadastrado em</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredApprovals.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                            <CheckSquare size={16} className="text-amber-600 flex-shrink-0" />
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.description || <span className="text-slate-400 italic">Sem descrição</span>}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                item.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditType(item)}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Editar tipo de aprovação"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteType(item)}
                                className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Desativar / Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  {activeTab === 'categories' && <FolderTree size={20} />}
                  {activeTab === 'locations' && <MapPin size={20} />}
                  {activeTab === 'teams' && <Users2 size={20} />}
                  {activeTab === 'approvals' && <CheckSquare size={20} />}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {activeTab === 'categories' && 'Nova Categoria'}
                  {activeTab === 'locations' && 'Nova Localização'}
                  {activeTab === 'teams' && 'Nova Equipe'}
                  {activeTab === 'approvals' && 'Novo Tipo de Aprovação'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === 'categories'
                      ? 'Ex: Ar Condicionado, Pintura, Elétrica'
                      : activeTab === 'locations'
                      ? 'Ex: Apto 302, Bloco B, Salão de Jogos'
                      : activeTab === 'teams'
                      ? 'Ex: Equipe de Manutenção Elétrica'
                      : 'Ex: Aprovação de Orçamento, Horário Especial...'
                  }
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes ou escopo desta entidade..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Se for Tipo de Aprovação: Checkbox Ativo */}
              {activeTab === 'approvals' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Tipo de aprovação ativo e disponível para seleção
                  </label>
                </div>
              )}

              {/* Se for Categoria ou Localização, suporta pai/filho */}
              {activeTab === 'categories' && categories.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Categoria Pai (Opcional)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Nenhuma (Categoria Principal)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'locations' && locations.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Localização Pai / Bloco (Opcional)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Nenhuma (Local Principal)</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Se for Equipe, permite vincular membros iniciais */}
              {activeTab === 'teams' && users.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vincular Usuários / Colaboradores (Opcional)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Selecione os usuários que farão parte desta equipe ({formData.memberIds.length} selecionados):
                  </p>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50/50">
                    {users
                      .filter((u) => u.status === 'ACTIVE')
                      .map((u) => {
                        const isSelected = formData.memberIds.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                memberIds: isSelected
                                  ? formData.memberIds.filter((id) => id !== u.id)
                                  : [...formData.memberIds, u.id]
                              });
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                              isSelected
                                ? 'bg-purple-50 text-purple-900 border border-purple-200 font-medium'
                                : 'hover:bg-white text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="rounded text-purple-600 focus:ring-purple-500 pointer-events-none"
                              />
                              <div>
                                <span className="font-semibold">{u.name}</span>
                                <span className="text-slate-400 ml-1.5 text-[11px]">({u.email})</span>
                              </div>
                            </div>
                            <div>{getRoleBadge(u.role)}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button type="submit" loading={saving} className="px-5">
                  Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Tipo de Aprovação */}
      {isEditTypeOpen && editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <CheckSquare size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Editar Tipo de Aprovação</h3>
              </div>
              <button
                onClick={() => setIsEditTypeOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditTypeSubmit} className="p-6 space-y-4">
              {editTypeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{editTypeError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTypeForm.name}
                  onChange={(e) => setEditTypeForm({ ...editTypeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={editTypeForm.description}
                  onChange={(e) => setEditTypeForm({ ...editTypeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editTypeForm.isActive}
                  onChange={(e) => setEditTypeForm({ ...editTypeForm, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Tipo de aprovação ativo e disponível para seleção
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditTypeOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button type="submit" loading={savingEditType} className="px-5">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Membros da Equipe */}
      {isManageMembersOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Membros da Equipe</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedTeam.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsManageMembersOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {manageMembersError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{manageMembersError}</span>
                </div>
              )}

              {/* Search user */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nome, e-mail ou perfil..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Selected Count Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                <span className="font-medium">
                  {teamMemberIds.length} {teamMemberIds.length === 1 ? 'usuário vinculado' : 'usuários vinculados'} a esta equipe
                </span>
                {teamMemberIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTeamMemberIds([])}
                    className="text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
                  >
                    Desvincular todos
                  </button>
                )}
              </div>

              {/* User list */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {filteredUsersForModal.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Nenhum colaborador encontrado com o filtro aplicado.
                  </div>
                ) : (
                  filteredUsersForModal.map((u) => {
                    const isSelected = teamMemberIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleMember(u.id)}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-purple-600 focus:ring-purple-500 pointer-events-none"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getRoleBadge(u.role)}
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">
                              <UserCheck size={12} />
                              Membro
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsManageMembersOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <Button onClick={handleSaveMembers} loading={savingMembers} className="px-5">
                Salvar Vinculações
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
