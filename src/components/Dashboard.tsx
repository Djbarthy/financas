import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import Header from './Header';
import Sidebar from './Sidebar';
import WalletView from './WalletView';
import ChartsView from './ChartsView';
import TransactionCarousel from './TransactionCarousel';
import WalletForm from './WalletForm';
import AnimatedNumber from './AnimatedNumber';

const Dashboard = () => {
  const { activeWallet, updateWallet, deleteWallet, wallets, getWalletBalance } = useFinancial();
  const [currentView, setCurrentView] = useState<'transactions' | 'charts'>('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex relative">
        {/* Sidebar with improved positioning */}
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
        </main>
      </div>

      {/* Transaction Carousel with improved positioning */}
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
