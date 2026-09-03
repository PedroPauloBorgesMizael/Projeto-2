import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // O backend ainda espera "email", então mapeamos o usuário para o campo email
      const response = await authService.login(username, password);

      // Sucesso no login, salvar token no contexto
      signIn(response.token, response.user, response.refreshToken);
      navigate('/tickets');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Usuário ou senha inválidos.');
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-slate-50 text-slate-800">
      {/* Left Column (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-slate-900 opacity-90 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')" }}
        />

        <div className="relative z-20 flex items-center gap-2 mb-12">
           <img src="/logo-horizontal.png" alt="HelpHome" className="h-8 brightness-0 invert" />
        </div>

        <div className="relative z-20 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Gestão de chamados e<br />manutenção descomplicada.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Centralize suas vistorias, otimize o trabalho de sua equipe de campo e mantenha a conformidade predial de todo o seu portfólio de imóveis em uma única plataforma integrada.
          </p>
        </div>

        <div className="relative z-20 grid grid-cols-3 gap-8 mt-12 border-t border-slate-700 pt-8">
          <div>
            <div className="text-3xl font-bold mb-1">98.4%</div>
            <div className="text-slate-400 text-sm">SLA cumprido</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">45%</div>
            <div className="text-slate-400 text-sm">Redução de custos</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">10k+</div>
            <div className="text-slate-400 text-sm">Prédios monitorados</div>
          </div>
        </div>
      </div>

      {/* Right Column (Login Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        {/* Mobile Header elements */}
        <div className="absolute top-6 left-6 flex lg:hidden">
          <button className="text-slate-600 hover:text-slate-900">
            <ArrowLeft size={24} />
          </button>
        </div>
        <div className="absolute top-6 right-6 flex lg:hidden">
          <span className="font-semibold text-slate-800">Suporte</span>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo-vertical.png" alt="HelpHome" className="h-16 mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Acesse sua conta</h2>
            <p className="text-slate-500 text-center text-sm">
              Insira suas credenciais para gerenciar seus chamados
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">Lembrar-me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" loading={loading}>
              Entrar no Painel
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Novo no HelpHome? <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">Criar conta</a>
          </div>
        </div>

        <div className="absolute bottom-6 flex justify-between items-center w-full px-12 lg:hidden">
            {/* O dropdown de idioma poderia ir aqui, ou no footer do lg */}
            <div className="mx-auto flex gap-1 items-center text-slate-500 text-sm">
              Português (Brasil) <span className="text-xs">▼</span>
            </div>
        </div>
        
        {/* Footer info for desktop */}
        <div className="hidden lg:flex absolute bottom-6 w-full px-12 justify-between items-center text-xs text-slate-400">
          <div>© 2026 HelpHome S.A.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">Termos</a>
            <a href="#" className="hover:text-slate-600">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}
