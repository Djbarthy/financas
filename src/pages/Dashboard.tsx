import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import WalletView from '../components/WalletView';
import ChartsView from '../components/ChartsView';
import TransactionCarousel from '../components/TransactionCarousel';
import WalletForm from '../components/WalletForm';
import AnimatedNumber from '../components/AnimatedNumber';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, LogOut, User, Shield, Wallet, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { activeWallet, updateWallet, deleteWallet, wallets, getWalletBalance } = useFinancial();
  const [currentView, setCurrentView] = useState<'transactions' | 'charts'>('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  // Se ainda está carregando a autenticação, mostra loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet);
    setShowWalletForm(true);
  };

  const handleDeleteWallet = (wallet) => {
    if (window.confirm('Tem certeza que deseja remover esta carteira?')) {
      deleteWallet(wallet.id);
    }
  };

  const handleCloseWalletForm = () => {
    setShowWalletForm(false);
    setEditingWallet(null);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Usando nosso componente Header com botão de sincronização */}
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Dashboard Content */}
      <div className="flex relative">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 
          fixed lg:relative 
          top-0 left-0
          z-[999] lg:z-auto 
          w-screen lg:w-64
          h-screen 
          transition-transform duration-300 ease-in-out
          lg:block
        `}>
          <Sidebar 
            onCreateWallet={() => {
              setSidebarOpen(false);
              setShowWalletForm(true);
            }}
            onCloseSidebar={() => setSidebarOpen(false)}
            onEditWallet={(wallet) => {
              setSidebarOpen(false);
              handleEditWallet(wallet);
            }}
            onDeleteWallet={handleDeleteWallet}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className={`
          flex-1 
          p-4 md:p-6 
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
        `}>
          {/* Loading state */}
          {authLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Carregando suas carteiras...</p>
              </div>
            </div>
          )}

          {/* Welcome section for new users */}
          {!authLoading && wallets.length === 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Bem-vindo, {user.email}!</span>
                  </CardTitle>
                  <CardDescription>
                    Comece criando sua primeira carteira para organizar suas finanças
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
                      <h3 className="font-semibold mb-1">Criar Carteira</h3>
                      <p className="text-sm text-gray-600">Organize suas finanças por categoria</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">2</div>
                      <h3 className="font-semibold mb-1">Adicionar Transações</h3>
                      <p className="text-sm text-gray-600">Registre receitas e despesas</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">3</div>
                      <h3 className="font-semibold mb-1">Acompanhar</h3>
                      <p className="text-sm text-gray-600">Visualize gráficos e relatórios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Stats */}
          {!authLoading && wallets.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Wallet className="h-5 w-5" />
                      <span>Carteiras</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{wallets.length}</div>
                    <p className="text-xs text-gray-500 mt-1">Total de carteiras</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Transações</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {wallets.reduce((total, wallet) => {
                        // Aqui você pode adicionar a lógica para contar transações
                        return total + 0; // Placeholder
                      }, 0)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total de transações</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Saldo Total</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      R$ {wallets.reduce((total, wallet) => {
                        return total + getWalletBalance(wallet.id);
                      }, 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Saldo de todas as carteiras</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!authLoading && (
            <>
              {!activeWallet ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Nenhuma carteira selecionada</p>
                    <button
                      onClick={() => setShowWalletForm(true)}
                      className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary/90"
                    >
                      Criar Primeira Carteira
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {currentView === 'transactions' && (
                    <WalletView onAddTransaction={() => setShowTransactionForm(true)} />
                  )}
                  {currentView === 'charts' && <ChartsView />}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Transaction Carousel */}
      {showTransactionForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <TransactionCarousel onClose={() => setShowTransactionForm(false)} />
        </div>
      )}

      {/* Wallet Form */}
      {showWalletForm && (
        <WalletForm onClose={handleCloseWalletForm} wallet={editingWallet} />
      )}

      {/* Footer saldo mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-center sm:hidden z-50">
        {activeWallet && (
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-600 dark:text-gray-300">Saldo:</span>
            <AnimatedNumber value={getWalletBalance(activeWallet.id)} className={`text-xl font-extrabold ${activeWallet && (getWalletBalance(activeWallet.id) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 