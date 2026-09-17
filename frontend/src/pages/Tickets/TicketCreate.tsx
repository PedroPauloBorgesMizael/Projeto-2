import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { ArrowLeft, Save, MapPin, FolderTree, AlertCircle, Home, Trees } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { CategoryItem, LocationItem } from '../../interface/auxiliary';

export function TicketCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationType, setLocationType] = useState<'apartment' | 'external'>('apartment');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'LOW',
    selectedLocationId: user?.locationId || '',
    externalLocation: '',
  });

  useEffect(() => {
    let mounted = true;

    const loadFormData = async () => {
      try {
        setLoadingData(true);
        const [catRes, locRes] = await Promise.all([
          api.get<CategoryItem[]>('/categories'),
          api.get<LocationItem[]>('/locations')
        ]);

        if (mounted) {
          setCategories(catRes.data);
          setLocations(locRes.data);

          // Se o usuário tem locationId, já pré-seleciona
          if (user?.locationId) {
            setFormData((prev) => ({ ...prev, selectedLocationId: user.locationId || '' }));
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados para o chamado:', error);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };

    loadFormData();
    return () => { mounted = false; };
  }, [user?.locationId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const userLocationName =
    user?.location?.name ||
    locations.find((l) => l.id === (user?.locationId || formData.selectedLocationId))?.name;

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'TECHNICIAN';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.categoryId) {
      setErrorMessage('Por favor, selecione uma categoria para a solicitação.');
      return;
    }

    try {
      setLoading(true);

      const selectedCat = categories.find((c) => c.id === formData.categoryId);

      const payload: {
        title: string;
        description: string;
        categoryId: string;
        category?: string;
        priority: string;
        locationId?: string;
        location?: string;
      } = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        category: selectedCat?.name || undefined,
        priority: formData.priority,
      };

      if (locationType === 'apartment') {
        const finalLocationId = isStaff
          ? (formData.selectedLocationId || user?.locationId)
          : user?.locationId;

        if (!finalLocationId) {
          setErrorMessage(
            isStaff
              ? 'Por favor, selecione a localização do apartamento/unidade atendida.'
              : 'Seu usuário não possui uma residência vinculada no cadastro. Por favor, contate a administração.'
          );
          setLoading(false);
          return;
        }
        payload.locationId = finalLocationId;
      } else {
        if (!formData.externalLocation.trim()) {
          setErrorMessage('Por favor, descreva o local da área externa.');
          setLoading(false);
          return;
        }
        payload.location = formData.externalLocation;
      }

      await api.post('/tickets', payload);
      navigate('/tickets');
    } catch (error: unknown) {
      console.error('Erro ao criar chamado:', error);
      const errorMsg = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao criar solicitação. Verifique os dados e tente novamente.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[92%] lg:max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 lg:p-10">
        <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
          <button
            onClick={() => navigate('/tickets')}
            className="text-slate-500 hover:text-slate-800 mr-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nova Solicitação de Manutenção</h1>
            <p className="text-slate-500 text-sm">Abra um chamado com os detalhes do problema</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Problema <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              placeholder="Ex: Vazamento sob a pia da cozinha / Luz do corredor queimada"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição Detalhada <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Descreva o que está acontecendo, quando começou e detalhes importantes para a equipe técnica..."
            />
          </div>

          {/* Local do Chamado */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Localização da Ocorrência <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  locationType === 'apartment'
                    ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="locationType"
                  value="apartment"
                  checked={locationType === 'apartment'}
                  onChange={() => setLocationType('apartment')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Home size={18} className="text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Minha Unidade</div>
                    <div className="text-xs text-slate-500">Apartamento ou sala privativa</div>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  locationType === 'external'
                    ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="locationType"
                  value="external"
                  checked={locationType === 'external'}
                  onChange={() => setLocationType('external')}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Trees size={18} className="text-emerald-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Área Comum / Externa</div>
                    <div className="text-xs text-slate-500">Corredor, piscina, garagem, hall</div>
                  </div>
                </div>
              </label>
            </div>

            {/* Se for Apartamento / Residência */}
            {locationType === 'apartment' && (
              <div className="pt-2">
                {/* Usuário comum (Solicitante/Morador): NÃO aparece opção de selecionar, pega direto da conta */}
                {!isStaff && (
                  <div>
                    {userLocationName ? (
                      <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                            Residência vinculada
                          </div>
                          <div className="text-base font-bold text-slate-900">
                            {userLocationName}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                        <span>
                          Nenhuma residência vinculada ao seu usuário no cadastro. Entre em contato com a administração predial.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff (Técnicos, Administradores e Gerentes): APARECE a opção de selecionar a residência */}
                {isStaff && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500" />
                      Selecione o Apartamento / Residência atendida: <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="selectedLocationId"
                      value={formData.selectedLocationId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Selecione a residência/unidade...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Se for Área Externa: digitar texto */}
            {locationType === 'external' && (
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Descreva o local da área externa / comum: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="externalLocation"
                    required
                    value={formData.externalLocation}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Piscina - Borda direita / Hall do Bloco A / Garagem G1 vaga 12"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FolderTree size={14} className="text-slate-500" />
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                required
                disabled={loadingData}
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Prioridade
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              >
                <option value="LOW">Baixa (Prazo: 7 dias)</option>
                <option value="MEDIUM">Média (Prazo: 3 dias)</option>
                <option value="HIGH">Alta (Prazo: 24 horas)</option>
                <option value="CRITICAL">Crítica (Prazo: 4 horas)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <div className="w-40">
              <Button type="submit" loading={loading} className="gap-2 w-full">
                <Save size={18} />
                <span>Salvar Chamado</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
