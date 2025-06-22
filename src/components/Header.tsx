import React, { useEffect, useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/formatters';
import { Menu, BarChart3, List, Eye, EyeOff, Undo2, Redo2, RefreshCw, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AnimatedNumber from './AnimatedNumber';

interface HeaderProps {
  currentView: 'transactions' | 'charts';
  onViewChange: (view: 'transactions' | 'charts') => void;
  onMenuClick: () => void;
}

// Função utilitária para determinar se a cor é escura
function isDarkColor(hex: string) {
  if (!hex) return false;
  // Remove o # se existir
  hex = hex.replace('#', '');
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onMenuClick }) => {
  const { activeWallet, getWalletBalance, syncing, flushSyncQueue } = useFinancial();
  const { user, signOut } = useAuth();

  const formatLastSync = () => {
    // A lógica de lastSync foi removida do contexto por enquanto.
    // Pode ser readicionada futuramente se necessário.
    return 'agora';
  };

  const handleSyncClick = async () => {
    try {
      await flushSyncQueue();
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Se não há carteira ativa, mostra header simplificado
  if (!activeWallet) {
    return (
      <>
        <TooltipProvider>
          <header className="border-b p-4 h-24 flex items-center justify-between bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Sistema Financeiro
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {/* Informações do usuário e sincronização - POR ÚLTIMO */}
              <div className="flex items-center space-x-2 ml-4">
                {user && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
                    {user.email}
                  </span>
                )}
                {/* Botão de sincronização */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSyncClick}
                      disabled={syncing}
                      className="p-2 h-8 w-8 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <RefreshCw 
                        className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{syncing ? 'Sincronizando...' : `Sincronizar (última: ${formatLastSync()})`}</p>
                  </TooltipContent>
                </Tooltip>
                {/* Botão de logout */}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>
        </TooltipProvider>
      </>
    );
  }

  // Header completo com carteira ativa
  const balance = getWalletBalance(activeWallet.id);
  const headerBg = activeWallet.color || '#b66e6f';
  const darkHeader = isDarkColor(headerBg);
  const hasProfileImage = !!activeWallet.imageUrl;

  return (
    <>
      <TooltipProvider>
        <header
          className={`border-b p-4 h-24 flex items-center transition-colors relative overflow-hidden`}
          style={{
            background: hasProfileImage ? undefined : headerBg,
            borderColor: darkHeader ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
          }}
        >
          {/* Imagem de fundo desfocada */}
          {hasProfileImage && (
            <div className="absolute inset-0 w-full h-full z-0">
              <img
                src={activeWallet.imageUrl}
                alt="Fundo da carteira"
                className="w-full h-full object-cover scale-125 blur-md"
                style={{ objectPosition: 'center' }}
              />
              {/* Overlay para contraste */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          <div className="flex items-center justify-between w-full z-10">
            <div className="flex items-center space-x-4">
              {/* Imagem da carteira */}
              {activeWallet.imageUrl ? (
                <img
                  src={activeWallet.imageUrl}
                  alt={activeWallet.name}
                  className={`w-10 h-10 rounded-full object-cover mr-2 cursor-pointer ${darkHeader ? 'ring-2 ring-white/70' : ''}`}
                  onClick={onMenuClick}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 cursor-pointer ${darkHeader ? 'bg-white/20' : 'bg-brand-primary/10'}`}
                  onClick={onMenuClick}
                >
                  {/* Sem ícone */}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <h1 className="text-xl font-bold flex items-center text-white" style={{
                  WebkitTextStroke: '1px black',
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                }}>
                  {activeWallet.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant={currentView === 'transactions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('transactions')}
                className={currentView === 'transactions' ? `${darkHeader ? 'bg-white/20 text-white' : 'bg-brand-primary hover:bg-brand-rose-earthy'}` : ''}
              >
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Transações</span>
              </Button>
              <Button
                variant={currentView === 'charts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('charts')}
                className={currentView === 'charts' ? `${darkHeader ? 'bg-white/20 text-white' : 'bg-brand-primary hover:bg-brand-rose-earthy'}` : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Gráficos</span>
              </Button>
              
              {/* Informações do usuário e sincronização - POR ÚLTIMO */}
              <div className="flex items-center space-x-2 ml-4">
                {user && (
                  <span className="text-sm text-white/90 hidden sm:inline" style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                  }}>
                    {user.email}
                  </span>
                )}
                {/* Botão de sincronização */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSyncClick}
                      disabled={syncing}
                      className={`p-2 h-8 w-8 ${darkHeader ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <RefreshCw 
                        className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{syncing ? 'Sincronizando...' : `Sincronizar (última: ${formatLastSync()})`}</p>
                  </TooltipContent>
                </Tooltip>
                {/* Botão de logout */}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
      </TooltipProvider>
    </>
  );
};

export default Header;
