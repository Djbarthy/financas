import React, { useState, useRef } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Wallet, Menu, Edit, Trash2, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Wallet as WalletType } from '@/types/financial';

interface SidebarProps {
  onCreateWallet: () => void;
  onCloseSidebar: () => void;
  onEditWallet?: (wallet: WalletType) => void;
  onDeleteWallet?: (wallet: WalletType) => void;
}

const WalletItem: React.FC<Omit<SidebarProps, 'onCreateWallet' | 'onCloseSidebar'> & { 
  wallet: WalletType; 
  isSubItem?: boolean;
  hasSubItems?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}> = ({
  wallet,
  onEditWallet,
  onDeleteWallet,
  isSubItem = false,
  hasSubItems = false,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { activeWallet, setActiveWallet, getWalletBalance } = useFinancial();
  const balance = getWalletBalance(wallet.id);
  const isActive = activeWallet?.id === wallet.id;

  const handleDoubleClick = () => {
    if (hasSubItems && onToggleExpand) {
      onToggleExpand();
    }
  };

  return (
    <div
      className={`p-3 rounded-lg transition-all duration-200 group border-2 select-none ${
        isActive
          ? 'text-white shadow-lg border-brand-primary bg-brand-primary/90 dark:bg-brand-yellow-pastel/80'
          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-transparent opacity-80'
      } ${isSubItem ? 'ml-4' : ''}`}
      style={isActive && wallet.color ? { background: wallet.color } : {}}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center space-x-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive ? 'bg-white/20' : 'bg-brand-primary/10 dark:bg-brand-yellow-pastel/10'
          }`}
          onClick={() => setActiveWallet(wallet)}
          style={{ cursor: 'pointer' }}
        >
          {wallet.imageUrl ? (
            <img src={wallet.imageUrl} alt={wallet.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <Wallet className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-primary dark:text-brand-yellow-pastel'}`} />
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setActiveWallet(wallet)}>
          <h3 className="font-medium truncate text-sm">{wallet.name}</h3>
          <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="flex space-x-1 transition-opacity opacity-0 group-hover:opacity-100 flex-shrink-0">
          {hasSubItems && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleExpand} 
              className="h-6 w-6 p-0" 
              title={isExpanded ? "Recolher" : "Expandir"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEditWallet && onEditWallet(wallet)} className="h-6 w-6 p-0" title="Editar">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteWallet && onDeleteWallet(wallet)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Remover"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onCreateWallet, onCloseSidebar, onEditWallet, onDeleteWallet }) => {
  const { wallets, activeWallet, setActiveWallet, getWalletBalance, moveWallet } = useFinancial();
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set());

  // Filtra carteiras principais (sem parentId)
  const mainWallets = wallets.filter(w => !w.parentId);

  // Agrupa sub-carteiras por parentId
  const subWalletsMap = wallets.reduce((acc, wallet) => {
    if (wallet.parentId) {
      if (!acc[wallet.parentId]) {
        acc[wallet.parentId] = [];
      }
      acc[wallet.parentId].push(wallet);
    }
    return acc;
  }, {} as Record<string, WalletType[]>);

  const toggleExpanded = (walletId: string) => {
    setExpandedWallets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(walletId)) {
        newSet.delete(walletId);
      } else {
        newSet.add(walletId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative">
      {/* Botão de fechar lateral mobile */}
      <button
        onClick={onCloseSidebar}
        className="block sm:hidden absolute left-2 top-4 z-50 bg-gray-100 dark:bg-gray-700 rounded-full p-2 shadow-md"
        title="Fechar menu lateral"
      >
        <ChevronLeft className="w-6 h-6 text-brand-primary dark:text-brand-yellow-pastel" />
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 items-center mb-3">
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseSidebar}
              className="block sm:hidden"
              title="Fechar menu lateral"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div></div>
        </div>
        <Button onClick={onCreateWallet} className="w-full mb-2 text-white font-semibold border" style={{ backgroundColor: '#237e18' }} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Carteira
        </Button>
      </div>

      {/* Wallets List */}
      <div className="flex-1 overflow-auto p-2">
        <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-yellow-pastel text-center mb-3">Carteiras</h2>
        {mainWallets.map((wallet) => {
          const subWallets = subWalletsMap[wallet.id] || [];
          const isExpanded = expandedWallets.has(wallet.id);
          
          return (
            <div key={wallet.id} className="mb-2">
              <WalletItem 
                wallet={wallet} 
                onEditWallet={onEditWallet} 
                onDeleteWallet={onDeleteWallet}
                hasSubItems={subWallets.length > 0}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpanded(wallet.id)}
              />
              {subWallets.length > 0 && (
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="mt-2 space-y-2">
                    {subWallets.map((subWallet, index) => (
                      <div 
                        key={subWallet.id} 
                        className={`transform transition-all duration-300 ease-in-out ${
                          isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                        }`}
                        style={{
                          transitionDelay: isExpanded ? `${index * 100}ms` : '0ms'
                        }}
                      >
                        <WalletItem 
                          wallet={subWallet} 
                          onEditWallet={onEditWallet} 
                          onDeleteWallet={onDeleteWallet} 
                          isSubItem 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {wallets.length} carteira{wallets.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
