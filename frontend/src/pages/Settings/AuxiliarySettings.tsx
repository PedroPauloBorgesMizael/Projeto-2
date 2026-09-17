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
  Layers,
  Briefcase
} from 'lucide-react';
import { auxiliaryService } from '../../services/auxiliaryService';
import type { CategoryItem, LocationItem, TeamItem } from '../../interface/auxiliary';
import { Button } from '../../components/Button';

type ActiveTab = 'categories' | 'locations' | 'teams';

export function AuxiliarySettings() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('categories');
  const [, startTransition] = useTransition();

  // Data states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  });

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
      const [catRes, locRes, teamRes] = await Promise.all([
        auxiliaryService.listCategories(),
        auxiliaryService.listLocations(),
        auxiliaryService.listTeams()
      ]);
      setCategories(catRes);
      setLocations(locRes);
      setTeams(teamRes);
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
    setFormData({ name: '', description: '', parentId: '' });
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
      } else {
        await auxiliaryService.createTeam({
          name: formData.name,
          description: formData.description || undefined
        });
        showFeedback('success', 'Equipe cadastrada com sucesso!');
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
            <span className="text-sm font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0a192f] text-white rounded-lg shadow-sm">
                <Layers size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Cadastros Auxiliares</h1>
                <p className="text-slate-500 text-sm">
                  Gerencie as entidades de apoio para abertura e triagem de chamados
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleOpenModal} className="w-full sm:w-auto gap-2 px-5 py-2.5 shadow-sm">
            <Plus size={18} />
            <span>
              {activeTab === 'categories' && 'Nova Categoria'}
              {activeTab === 'locations' && 'Nova Localização'}
              {activeTab === 'teams' && 'Nova Equipe'}
            </span>
          </Button>
        </div>

        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
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
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => {
              setActiveTab('categories');
              setSearch('');
            }}
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
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
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
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
            className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users2 size={18} />
            <span>Equipes ({teams.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Filtrar ${
                activeTab === 'categories' ? 'categorias' : activeTab === 'locations' ? 'localizações' : 'equipes'
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
                        <th className="px-6 py-4">Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTeams.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                            <Briefcase size={16} className="text-purple-600 flex-shrink-0" />
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-xs">
                            {item.description || <span className="text-slate-400 italic">Sem descrição</span>}
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
            </>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  {activeTab === 'categories' && <FolderTree size={20} />}
                  {activeTab === 'locations' && <MapPin size={20} />}
                  {activeTab === 'teams' && <Users2 size={20} />}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {activeTab === 'categories' && 'Nova Categoria'}
                  {activeTab === 'locations' && 'Nova Localização'}
                  {activeTab === 'teams' && 'Nova Equipe'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
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
                      : 'Ex: Equipe de Manutenção Elétrica'
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
    </div>
  );
}
