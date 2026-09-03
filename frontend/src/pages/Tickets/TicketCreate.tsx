import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Category {
  id: string;
  name: string;
}

export function TicketCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locationType, setLocationType] = useState<'apartment' | 'external'>('apartment');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'LOW',
    externalLocation: '',
  });

  React.useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (mounted) setCategories(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias', error);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload: {
        title: string;
        description: string;
        categoryId: string;
        priority: string;
        locationId?: string;
        location?: string;
      } = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        priority: formData.priority,
      };

      if (locationType === 'apartment') {
        payload.locationId = user?.locationId; // Pega o ID da localização vinculada ao usuário
      } else {
        payload.location = formData.externalLocation; // Descrição da área externa
      }

      await api.post('/tickets', payload);
      navigate('/tickets');
    } catch (error) {
      console.error('Erro ao criar solicitação', error);
      alert('Erro ao criar solicitação. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/tickets')}
            className="text-slate-600 hover:text-slate-900 mr-4 transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Nova Solicitação</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
              placeholder="Ex: Ar condicionado quebrado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none"
              placeholder="Detalhe o problema..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Local do Chamado
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="apartment"
                    checked={locationType === 'apartment'}
                    onChange={() => setLocationType('apartment')}
                    className="w-4 h-4 text-[#0a192f] border-slate-300 focus:ring-[#0a192f]"
                  />
                  <span className="text-sm text-slate-700">Meu apartamento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locationType"
                    value="external"
                    checked={locationType === 'external'}
                    onChange={() => setLocationType('external')}
                    className="w-4 h-4 text-[#0a192f] border-slate-300 focus:ring-[#0a192f]"
                  />
                  <span className="text-sm text-slate-700">Área externa</span>
                </label>
              </div>

              {locationType === 'external' && (
                <input
                  type="text"
                  name="externalLocation"
                  required
                  value={formData.externalLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all"
                  placeholder="Descreva a área externa (Ex: Corredor, Piscina, Garagem)"
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all bg-white"
                required
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prioridade
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <div className="w-40">
              <Button type="submit" loading={loading} className="gap-2">
                <Save size={20} />
                <span>Salvar</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
