import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import TransactionList from './TransactionList';
import { Plus, Calendar, Filter, Copy, Undo2, Redo2 } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface WalletViewProps {
  onAddTransaction: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ onAddTransaction }) => {
  const { activeWallet, duplicateWallet, undo, redo, canUndo, canRedo } = useFinancial();
  const [viewMode, setViewMode] = useState<'realtime' | 'complete'>('realtime');
  const balance = activeWallet ? useFinancial().getWalletBalance(activeWallet.id) : 0;

  if (!activeWallet) return null;

  return (
    <>
      {/* Saldo abaixo do header */}
      <div className="w-full flex flex-col items-center mt-2 mb-2 hidden sm:flex">
        <span className="text-base font-medium text-gray-600 dark:text-white/80">Saldo:</span>
        <AnimatedNumber 
          value={balance} 
          className={`text-3xl sm:text-4xl font-extrabold leading-tight ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} 
        />
      </div>
      <div className="space-y-6">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                const newName = window.prompt('Digite o nome da nova carteira duplicada:');
                if (newName && newName.trim()) {
                  duplicateWallet(activeWallet.id, newName.trim());
                }
              }}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicar Carteira
            </Button>
            <Button size="icon" variant="outline" onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)">
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="outline" onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Y)">
              <Redo2 className="w-5 h-5" />
            </Button>
          </div>
          <Button
            onClick={onAddTransaction}
            className="bg-brand-rose-earthy hover:bg-brand-rose-light hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
        {/* Lista de transações */}
        <TransactionList />
        {/* Botão flutuante para mobile */}
        <Button
          onClick={onAddTransaction}
          size="icon"
          className="fixed bottom-24 right-6 z-50 rounded-full bg-brand-rose-earthy hover:bg-brand-rose-light shadow-lg sm:hidden w-16 h-16 flex items-center justify-center"
          aria-label="Nova Transação"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>
    </>
  );
};

export default WalletView;
