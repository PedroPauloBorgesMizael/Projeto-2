import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  slaTargetDate?: string;
  slaBreached?: boolean;
  categoryRef?: { id: string; name: string };
  locationRef?: { name: string };
  requester?: { name: string };
  technician?: { id: string; name: string };
  comments?: Array<{
    id: string;
    message: string;
    private: boolean;
    createdAt: string;
    user?: { name: string };
  }>;
}

export function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment states
  const [newComment, setNewComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Management states
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [technicians, setTechnicians] = useState<{id: string, name: string}[]>([]);
  const [updating, setUpdating] = useState(false);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do chamado', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const ticketRes = await api.get(`/tickets/${id}`);
        if (mounted) setTicket(ticketRes.data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do chamado', error);
      } finally {
        if (mounted) setLoading(false);
      }

      if (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'MANAGER') {
        try {
          const [catRes, userRes] = await Promise.all([
            api.get('/categories'),
            api.get('/users?role=TECHNICIAN')
          ]);
          if (mounted) {
            setCategories(catRes.data);
            if (userRes.data.data) setTechnicians(userRes.data.data);
          }
        } catch (error) {
          console.error('Erro ao buscar dados gerenciais', error);
        }
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [id, user?.role]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSendingComment(true);
      await api.post('/comments', {
        message: newComment,
        private: isPrivate,
        ticketId: id,
        userId: user?.id
      });
      setNewComment('');
      setIsPrivate(false);
      await fetchTicket(); // reload comments
    } catch {
      alert('Erro ao enviar comentário');
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}/status`, { status: e.target.value });
      await fetchTicket();
    } catch {
      alert('Erro ao atualizar status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}/category`, { categoryId: e.target.value });
      await fetchTicket();
    } catch {
      alert('Erro ao atualizar categoria');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setUpdating(true);
      const value = e.target.value;
      if (value) {
        await api.patch(`/tickets/${id}/assign`, { technicianId: value });
      }
      await fetchTicket();
    } catch {
      alert('Erro ao atribuir técnico');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a192f]"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl text-slate-700 mb-4">Chamado não encontrado</h2>
        <button onClick={() => navigate('/tickets')} className="text-blue-600 hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  const isStaff = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'MANAGER';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[92%] mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{ticket.title}</h1>
                <p className="text-slate-500">Aberto em {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Descrição</h3>
              <p className="text-slate-800 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 border-t border-slate-200 mt-6 pt-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Prioridade</h3>
                <p className="text-slate-800">{ticket.priority}</p>
              </div>
              {ticket.categoryRef && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Categoria</h3>
                  <p className="text-slate-800">{ticket.categoryRef.name}</p>
                </div>
              )}
              {ticket.locationRef && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Localização</h3>
                  <p className="text-slate-800">{ticket.locationRef.name}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Solicitante</h3>
                <p className="text-slate-800">{ticket.requester?.name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Técnico Responsável</h3>
                <p className="text-slate-800">{ticket.technician?.name || 'Não atribuído'}</p>
              </div>
            </div>

            {/* SLA Section */}
            {ticket.slaTargetDate && (
              <div className="border-t border-slate-200 mt-6 pt-6">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Prazos de SLA</h3>
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-lg border ${ticket.slaBreached ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <p className={`font-semibold ${ticket.slaBreached ? 'text-red-700' : 'text-green-700'}`}>
                      {ticket.slaBreached ? 'SLA Violado' : 'Dentro do Prazo'}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Data Limite: {new Date(ticket.slaTargetDate).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Comentários e Histórico</h3>
            
            <form onSubmit={handleAddComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none mb-3"
              />
              <div className="flex justify-between items-center">
                {isStaff && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 text-[#0a192f] border-slate-300 rounded focus:ring-[#0a192f]"
                    />
                    <span className="text-sm text-slate-700">Nota Interna (Apenas Equipe)</span>
                  </label>
                )}
                {!isStaff && <div />}
                <div className="w-40">
                  <Button type="submit" loading={sendingComment} disabled={!newComment.trim()} className="gap-2">
                    <Send size={18} />
                    <span>Enviar</span>
                  </Button>
                </div>
              </div>
            </form>

            {ticket.comments && ticket.comments.length > 0 ? (
              <div className="space-y-4">
                {ticket.comments.map((comment) => (
                  <div key={comment.id} className={`p-4 rounded-lg border ${comment.private ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-slate-700">
                        {comment.user?.name || 'Usuário'} {comment.private && <span className="text-amber-600 ml-2">🔒 Nota Interna</span>}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap text-sm">{comment.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg border border-slate-200">Nenhum comentário adicionado ainda.</p>
            )}
          </div>
        </div>

        {/* Gerenciamento Lateral (Apenas Staff) */}
        {isStaff && (
          <div className="w-full lg:w-80 xl:w-96 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Gerenciamento</h3>
              
              <div className="space-y-4 relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0a192f]"></div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={ticket.status}
                    onChange={handleStatusChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Técnico Responsável</label>
                  <select
                    value={ticket.technician?.id || ''}
                    onChange={handleAssignChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Não atribuído</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select
                    value={ticket.categoryRef?.id || ''}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
