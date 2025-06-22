import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw new Error(error);
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o painel...",
        className: "bg-green-500 text-white",
      });
      // O redirecionamento será tratado pelo AuthContext
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Entrar</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Digite suas credenciais para acessar sua conta</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400" />
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Senha
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300"
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar'}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-semibold text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 