import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Users2,
  User as UserIcon,
  Plus,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { approvalService } from '../../services/approvalService';
import { auxiliaryService } from '../../services/auxiliaryService';
import { userService } from '../../services/userService';
import type { ApprovalItem, ApprovalTypeItem } from '../../interface/approval';
import type { TeamItem } from '../../interface/auxiliary';
import type { UserItem } from '../../interface/user';

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
  requester?: { id: string; name: string; email: string };
  technician?: { id: string; name: string; email: string };
  team?: { id: string; name: string };
  comments?: Array<{
    id: string;
    message: string;
    private: boolean;
    createdAt: string;
    user?: { name: string };
  }>;
  approvals?: ApprovalItem[];
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [technicians, setTechnicians] = useState<{ id: string; name: string }[]>([]);
  const [updating, setUpdating] = useState(false);

  // Approval data states
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [approvalTypes, setApprovalTypes] = useState<ApprovalTypeItem[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);
  const [availableTeams, setAvailableTeams] = useState<TeamItem[]>([]);

  // Request Approval Modal states
  const [isRequestApprovalOpen, setIsRequestApprovalOpen] = useState(false);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [requestApprovalError, setRequestApprovalError] = useState('');
  const [approvalForm, setApprovalForm] = useState({
    approvalTypeId: '',
    targetType: 'USER' as 'USER' | 'TEAM',
    approverUserId: '',
    approverTeamId: '',
    notes: '',
  });

  // Decide Approval Modal states
  const [isDecideOpen, setIsDecideOpen] = useState(false);
  const [selectedApprovalToDecide, setSelectedApprovalToDecide] = useState<ApprovalItem | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [decideError, setDecideError] = useState('');

  // Toast feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const fetchTicket = async () => {
    if (!id) return;
    try {
      const [ticketRes, approvalsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        approvalService.listTicketApprovals(id),
      ]);
      setTicket(ticketRes.data);
      setApprovals(approvalsRes);
    } catch (error) {
      console.error('Erro ao buscar detalhes do chamado', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!id) return;
      try {
        const [ticketRes, approvalsRes] = await Promise.all([
          api.get(`/tickets/${id}`),
          approvalService.listTicketApprovals(id),
        ]);
        if (mounted) {
          setTicket(ticketRes.data);
          setApprovals(approvalsRes);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do chamado', error);
      } finally {
        if (mounted) setLoading(false);
      }

      if (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN' || user?.role === 'MANAGER' || user?.role === 'ASSISTANT') {
        try {
          const [catRes, userRes, typesRes, teamsRes, allUsersRes] = await Promise.all([
            api.get('/categories'),
            api.get('/users?role=TECHNICIAN'),
            approvalService.listApprovalTypes(true),
            auxiliaryService.listTeams(),
            userService.listUsers({ limit: 200 }),
          ]);
          if (mounted) {
            setCategories(catRes.data);
            if (userRes.data.data) setTechnicians(userRes.data.data);
            setApprovalTypes(typesRes);
            setAvailableTeams(teamsRes);
            setAvailableUsers(allUsersRes.data || []);
          }
        } catch (error) {
          console.error('Erro ao buscar dados gerenciais e de aprovação', error);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
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
        userId: user?.id,
      });
      setNewComment('');
      setIsPrivate(false);
      await fetchTicket();
    } catch {
      showFeedback('error', 'Erro ao enviar comentário.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}/status`, { status: e.target.value });
      await fetchTicket();
      showFeedback('success', 'Status do chamado atualizado com sucesso.');
    } catch {
      showFeedback('error', 'Erro ao atualizar status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setUpdating(true);
      await api.patch(`/tickets/${id}/category`, { categoryId: e.target.value });
      await fetchTicket();
      showFeedback('success', 'Categoria atualizada.');
    } catch {
      showFeedback('error', 'Erro ao atualizar categoria.');
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
      showFeedback('success', 'Técnico atribuído com sucesso.');
    } catch {
      showFeedback('error', 'Erro ao atribuir técnico.');
    } finally {
      setUpdating(false);
    }
  };

  // Approval Handlers
  const handleOpenRequestApproval = () => {
    setApprovalForm({
      approvalTypeId: approvalTypes.length > 0 ? approvalTypes[0].id : '',
      targetType: 'USER',
      approverUserId: '',
      approverTeamId: '',
      notes: '',
    });
    setRequestApprovalError('');
    setIsRequestApprovalOpen(true);
  };

  const handleRequestApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setRequestApprovalError('');

    if (!approvalForm.approvalTypeId) {
      setRequestApprovalError('Por favor, selecione um tipo de aprovação.');
      return;
    }

    if (approvalForm.targetType === 'USER' && !approvalForm.approverUserId) {
      setRequestApprovalError('Por favor, selecione a pessoa responsável pela aprovação.');
      return;
    }

    if (approvalForm.targetType === 'TEAM' && !approvalForm.approverTeamId) {
      setRequestApprovalError('Por favor, selecione a equipe responsável pela aprovação.');
      return;
    }

    try {
      setRequestingApproval(true);
      await approvalService.requestApproval({
        ticketId: id,
        approvalTypeId: approvalForm.approvalTypeId,
        approverUserId: approvalForm.targetType === 'USER' ? approvalForm.approverUserId : undefined,
        approverTeamId: approvalForm.targetType === 'TEAM' ? approvalForm.approverTeamId : undefined,
        notes: approvalForm.notes || undefined,
      });

      showFeedback('success', 'Solicitação de aprovação enviada com sucesso!');
      setIsRequestApprovalOpen(false);
      await fetchTicket();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Falha ao solicitar aprovação.';
      setRequestApprovalError(errorMsg);
    } finally {
      setRequestingApproval(false);
    }
  };

  const handleOpenDecideModal = (approval: ApprovalItem, type: 'APPROVED' | 'REJECTED') => {
    setSelectedApprovalToDecide(approval);
    setDecisionType(type);
    setDecisionNotes('');
    setDecideError('');
    setIsDecideOpen(true);
  };

  const handleDecideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApprovalToDecide) return;
    setDecideError('');

    try {
      setDeciding(true);
      await approvalService.decideApproval(selectedApprovalToDecide.id, {
        decision: decisionType,
        decisionNotes: decisionNotes || undefined,
      });

      showFeedback(
        'success',
        `Aprovação ${decisionType === 'APPROVED' ? 'concedida' : 'rejeitada'} com sucesso!`
      );
      setIsDecideOpen(false);
      await fetchTicket();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao registrar decisão de aprovação.';
      setDecideError(errorMsg);
    } finally {
      setDeciding(false);
    }
  };

  const handleCancelApproval = async (approvalId: string) => {
    if (!window.confirm('Deseja realmente cancelar esta solicitação de aprovação?')) return;
    try {
      await approvalService.cancelApproval(approvalId);
      showFeedback('success', 'Solicitação de aprovação cancelada.');
      await fetchTicket();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message ||
        'Erro ao cancelar aprovação.';
      showFeedback('error', errorMsg);
    }
  };

  // Checa se o usuário atual pode avaliar a aprovação
  const canUserDecide = (approval: ApprovalItem) => {
    if (approval.status !== 'PENDING') return false;
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
    if (approval.approverUserId && approval.approverUserId === user.id) return true;
    // Se for direcionada para uma equipe, verifica se a equipe do usuário bate
    if (approval.approverTeamId) {
      const matchingTeam = availableTeams.find((t) => t.id === approval.approverTeamId);
      if (matchingTeam?.members?.some((m) => m.id === user.id)) return true;
    }
    return false;
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
        <button onClick={() => navigate('/tickets')} className="text-blue-600 hover:underline cursor-pointer">
          Voltar para a lista
        </button>
      </div>
    );
  }

  const isStaff =
    user?.role === 'ADMIN' ||
    user?.role === 'TECHNICIAN' ||
    user?.role === 'MANAGER' ||
    user?.role === 'ASSISTANT';

  const isTicketOpen =
    ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED';

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="min-h-full bg-slate-50 py-6 sm:py-8">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate('/tickets')}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Voltar para lista de solicitações
            </button>

            {/* Ticket Information Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 mb-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{ticket.title}</h1>
                <p className="text-slate-500">Aberto em {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-2">
                {pendingApprovalsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock size={13} />
                    {pendingApprovalsCount} {pendingApprovalsCount === 1 ? 'aprovação pendente' : 'aprovações pendentes'}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
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
                  <div
                    className={`p-4 rounded-lg border ${
                      ticket.slaBreached ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}
                  >
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

          {/* ========================================================= */}
          {/* SEÇÃO DE APROVAÇÕES DO CHAMADO */}
          {/* ========================================================= */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Aprovações do Chamado</h3>
                  <p className="text-xs text-slate-500">
                    Validações de orçamento, serviço, horário ou autorizações requeridas.
                  </p>
                </div>
              </div>

              {isStaff && isTicketOpen && (
                <Button
                  onClick={handleOpenRequestApproval}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  <Plus size={16} />
                  <span>Solicitar Aprovação</span>
                </Button>
              )}
            </div>

            {approvals.length === 0 ? (
              <div className="p-6 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl text-center">
                <ShieldCheck size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Nenhuma aprovação vinculada a este chamado.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Quando o técnico responsável ou a equipe necessitar de autorização prévia (orçamento, serviço, horário especial), clique em "Solicitar Aprovação".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvals.map((approval) => {
                  const canDecide = canUserDecide(approval);
                  const isRequesterOrAdmin =
                    approval.requestedById === user?.id || user?.role === 'ADMIN' || user?.role === 'MANAGER';

                  return (
                    <div
                      key={approval.id}
                      className={`p-5 rounded-xl border transition-all ${
                        approval.status === 'PENDING'
                          ? 'bg-amber-50/40 border-amber-200'
                          : approval.status === 'APPROVED'
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : approval.status === 'REJECTED'
                          ? 'bg-red-50/30 border-red-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Top Row: Type and Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare size={18} className="text-amber-600 flex-shrink-0" />
                          <h4 className="font-bold text-slate-900 text-sm">
                            {approval.approvalType?.name || 'Tipo de Aprovação'}
                          </h4>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {approval.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                              <Clock size={13} className="text-amber-700" />
                              Pendente de Aprovação
                            </span>
                          )}
                          {approval.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-700" />
                              Aprovado
                            </span>
                          )}
                          {approval.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-200">
                              <XCircle size={13} className="text-red-700" />
                              Rejeitado
                            </span>
                          )}
                          {approval.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                              Cancelado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3 text-slate-600 bg-white/70 p-3 rounded-lg border border-slate-200/60">
                        <div>
                          <span className="text-slate-400 font-medium block mb-0.5">Solicitante:</span>
                          <span className="font-semibold text-slate-800">
                            {approval.requestedBy?.name || 'Técnico'}
                          </span>
                          <span className="text-slate-400 ml-1.5">
                            ({new Date(approval.createdAt).toLocaleString('pt-BR')})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-medium block mb-0.5">Destinatário da Aprovação:</span>
                          {approval.approverUser ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                              <UserIcon size={13} />
                              {approval.approverUser.name} ({approval.approverUser.email})
                            </span>
                          ) : approval.approverTeam ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-purple-700">
                              <Users2 size={13} />
                              Equipe {approval.approverTeam.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Geral</span>
                          )}
                        </div>
                      </div>

                      {/* Request Notes */}
                      {approval.notes && (
                        <div className="mb-3 text-xs bg-white/80 p-3 rounded-lg border border-slate-200/60">
                          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block mb-1">
                            Justificativa / Detalhes da Solicitação:
                          </span>
                          <p className="text-slate-800 whitespace-pre-wrap">{approval.notes}</p>
                        </div>
                      )}

                      {/* Decision Details (If already answered) */}
                      {approval.status !== 'PENDING' && (
                        <div
                          className={`p-3 rounded-lg text-xs border ${
                            approval.status === 'APPROVED'
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                              : approval.status === 'REJECTED'
                              ? 'bg-red-50/80 border-red-200 text-red-900'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 font-semibold mb-1">
                            <span>
                              {approval.status === 'APPROVED' && 'Avaliado e Aprovado por:'}{' '}
                              {approval.status === 'REJECTED' && 'Avaliado e Rejeitado por:'}{' '}
                              {approval.status === 'CANCELLED' && 'Cancelado por:'}{' '}
                              {approval.decidedBy?.name || 'Avaliador'}
                            </span>
                            {approval.decidedAt && (
                              <span className="text-[11px] font-normal opacity-80">
                                {new Date(approval.decidedAt).toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                          {approval.decisionNotes && (
                            <p className="mt-1 whitespace-pre-wrap">
                              <strong className="font-semibold">Parecer: </strong>
                              {approval.decisionNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons for Pending Approvals */}
                      {approval.status === 'PENDING' && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200/60 mt-3">
                          {isRequesterOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleCancelApproval(approval.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer mr-auto"
                            >
                              Cancelar Solicitação
                            </button>
                          )}

                          {canDecide ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenDecideModal(approval, 'REJECTED')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg border border-red-200 transition-colors cursor-pointer"
                              >
                                <XCircle size={14} />
                                <span>Rejeitar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDecideModal(approval, 'APPROVED')}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={14} />
                                <span>Aprovar</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Aguardando decisão de {approval.approverUser?.name || `membros da equipe ${approval.approverTeam?.name || ''}`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                      comment.private ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-slate-700">
                        {comment.user?.name || 'Usuário'}{' '}
                        {comment.private && <span className="text-amber-600 ml-2">🔒 Nota Interna</span>}
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
              <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg border border-slate-200">
                Nenhum comentário adicionado ainda.
              </p>
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
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
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
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* ========================================================= */}
      {/* MODAL: SOLICITAR APROVAÇÃO */}
      {/* ========================================================= */}
      {isRequestApprovalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Solicitar Aprovação</h3>
              </div>
              <button
                onClick={() => setIsRequestApprovalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestApprovalSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {requestApprovalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{requestApprovalError}</span>
                </div>
              )}

              {/* 1. Tipo de Aprovação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Aprovação <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={approvalForm.approvalTypeId}
                  onChange={(e) => setApprovalForm({ ...approvalForm, approvalTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Selecione o tipo de aprovação...</option>
                  {approvalTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {approvalTypes.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-1">
                    Nenhum tipo de aprovação ativo encontrado. Cadastre em "Cadastros Auxiliares".
                  </p>
                )}
              </div>

              {/* 2. Destinatário: Pessoa ou Equipe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Destinatário da Aprovação <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      approvalForm.targetType === 'USER'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={approvalForm.targetType === 'USER'}
                      onChange={() => setApprovalForm({ ...approvalForm, targetType: 'USER', approverTeamId: '' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <UserIcon size={16} />
                    <span className="text-xs">Pessoa Específica</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      approvalForm.targetType === 'TEAM'
                        ? 'border-purple-600 bg-purple-50/50 text-purple-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={approvalForm.targetType === 'TEAM'}
                      onChange={() => setApprovalForm({ ...approvalForm, targetType: 'TEAM', approverUserId: '' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <Users2 size={16} />
                    <span className="text-xs">Equipe / Grupo</span>
                  </label>
                </div>

                {/* Dropdown Pessoa */}
                {approvalForm.targetType === 'USER' && (
                  <div>
                    <select
                      required
                      value={approvalForm.approverUserId}
                      onChange={(e) => setApprovalForm({ ...approvalForm, approverUserId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Selecione o colaborador / responsável...</option>
                      {availableUsers
                        .filter((u) => u.status === 'ACTIVE')
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role}) - {u.email}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Dropdown Equipe */}
                {approvalForm.targetType === 'TEAM' && (
                  <div>
                    <select
                      required
                      value={approvalForm.approverTeamId}
                      onChange={(e) => setApprovalForm({ ...approvalForm, approverTeamId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Selecione a equipe responsável...</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.members?.length || 0} membros)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 3. Justificativa / Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Justificativa / Detalhes da Aprovação (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Valor total do orçamento R$ 380,00 para troca de fiação; horário sugerido para sábado às 14h..."
                  value={approvalForm.notes}
                  onChange={(e) => setApprovalForm({ ...approvalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestApprovalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  loading={requestingApproval}
                  className="px-5 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DECIDIR APROVAÇÃO (APROVAR OU REJEITAR) */}
      {/* ========================================================= */}
      {isDecideOpen && selectedApprovalToDecide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    decisionType === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {decisionType === 'APPROVED' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {decisionType === 'APPROVED' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedApprovalToDecide.approvalType?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDecideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDecideSubmit} className="p-6 space-y-4">
              {decideError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{decideError}</span>
                </div>
              )}

              <p className="text-xs text-slate-600">
                Você está prestes a <strong>{decisionType === 'APPROVED' ? 'APROVAR' : 'REJEITAR'}</strong> esta solicitação. Você pode adicionar um parecer ou justificativa abaixo:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Parecer / Justificativa {decisionType === 'REJECTED' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={decisionType === 'REJECTED'}
                  placeholder={
                    decisionType === 'APPROVED'
                      ? 'Ex: Aprovado conforme valores cotados...'
                      : 'Ex: Valor excede o limite estipulado; favor renegociar...'
                  }
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0a192f] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDecideOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  loading={deciding}
                  className={`px-5 text-white ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirmar {decisionType === 'APPROVED' ? 'Aprovação' : 'Rejeição'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
