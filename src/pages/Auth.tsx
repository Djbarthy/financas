import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { Loader2, Wallet, TrendingUp, Shield, Smartphone, Zap, BarChart3, PiggyBank, Users, HeartHandshake } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Se o usuário já está logado, redireciona
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-pink-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToForgotPassword={() => setMode('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-gray-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        {/* Lado Esquerdo - Vantagens */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-green-400 via-teal-400 to-pink-400 text-white relative">
          <div className="mb-8 flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vista 85</h1>
              <p className="text-sm text-white/80">Sistema Financeiro Inteligente</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">A maneira mais inteligente de gerenciar suas finanças</h2>
          <p className="text-white/90 mb-8">
            Controle total sobre suas carteiras, transações e metas financeiras, com sincronização em tempo real entre todos os seus dispositivos.
          </p>
          <ul className="space-y-5">
            <li className="flex items-center space-x-3">
              <span className="p-1.5 rounded-full bg-white/25"><BarChart3 className="h-5 w-5" /></span>
              <span>Análises e Gráficos Detalhados</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="p-1.5 rounded-full bg-white/25"><Smartphone className="h-5 w-5" /></span>
              <span>Totalmente Responsivo e Moderno</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="p-1.5 rounded-full bg-white/25"><Shield className="h-5 w-5" /></span>
              <span>Segurança e Privacidade em Primeiro Lugar</span>
            </li>
          </ul>
          <div className="absolute bottom-8 left-12 text-xs text-white/60">© 2024 Vista 85</div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full flex flex-col justify-center p-8 sm:p-12 bg-white dark:bg-gray-800">
          <div className="w-full max-w-md mx-auto">
            <div className="text-left mb-8">
               <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Acesse sua conta</h1>
               <p className="text-gray-500 dark:text-gray-400 mt-2">Entre com seu e-mail e senha para acessar o sistema.</p>
            </div>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 