import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Transaction, TransactionCategory } from '@/types/financial';
import { getCategoryInfo } from '@/utils/categories';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EditTransactionForm from './EditTransactionForm';
import { 
  Home, 
  UtensilsCrossed, 
  Gamepad2, 
  CreditCard, 
  Car, 
  Heart, 
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {}

const iconMap = {
  Home,
  UtensilsCrossed,
  Gamepad2,
  CreditCard,
  Car,
  Heart,
  MoreHorizontal,
};

const TransactionList: React.FC<TransactionListProps> = () => {
  const { transactions, deleteTransaction, activeWallet, updateTransaction } = useFinancial();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [period, setPeriod] = useState<'7d' | '15d' | '30d' | '90d' | 'custom'>('7d');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory[]>([]);

  if (!activeWallet) return null;

  const allTransactions = transactions?.filter(t => t.walletId === activeWallet.id) || [];
  
  // Filtro por período
  let filteredTransactions = allTransactions;
  const now = new Date();
  if (period !== 'custom') {
    const days = parseInt(period);
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days + 1);
    filteredTransactions = filteredTransactions.filter(t => {
      const d = new Date(t.date);
      return d >= startDate && d <= now;
    });
  } else if (dateRange.start && dateRange.end) {
    filteredTransactions = filteredTransactions.filter(t => {
      const d = new Date(t.date);
      return d >= dateRange.start! && d <= dateRange.end!;
    });
  }

  // Filtro por categoria
  if (categoryFilter.length > 0) {
    filteredTransactions = filteredTransactions.filter(t => categoryFilter.includes(t.category));
  }

  // Filtro por status de pagamento
  const paymentFilteredTransactions = filteredTransactions.filter(transaction => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'paid') return transaction.isPaid;
    if (paymentFilter === 'unpaid') return !transaction.isPaid;
    return true;
  });

  const sortedTransactions = [...paymentFilteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Categorias disponíveis
  const categories: TransactionCategory[] = [
    'fixed', 'food', 'leisure', 'debt', 'transport', 'health', 'uber', 'other'
  ];

  // UI do filtro
  const periodOptions = [
    { key: '7d', label: '7 dias' },
    { key: '15d', label: '15 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'custom', label: 'Personalizado' },
  ];

  if (sortedTransactions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Painel de Filtros */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filtros <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px]">
              <div className="mb-2">
                <span className="font-medium text-sm">Período:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {periodOptions.map(opt => (
                    <Button
                      key={opt.key}
                      size="sm"
                      variant={period === opt.key ? 'default' : 'outline'}
                      onClick={() => setPeriod(opt.key as any)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
              {period === 'custom' && (
                <div className="mb-2">
                  <span className="font-medium text-sm">Data inicial e final:</span>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="outline"
                      className="flex-1 justify-start"
                      onClick={() => {
                        const d = prompt('Digite a data inicial (AAAA-MM-DD):');
                        if (d) setDateRange(r => ({ ...r, start: new Date(d) }));
                      }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {dateRange.start ? format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 'Início'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start"
                      onClick={() => {
                        const d = prompt('Digite a data final (AAAA-MM-DD):');
                        if (d) setDateRange(r => ({ ...r, end: new Date(d) }));
                      }}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {dateRange.end ? format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}
                    </Button>
                  </div>
                </div>
              )}
              <div className="mb-2">
                <span className="font-medium text-sm">Categorias:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={categoryFilter.includes(cat) ? 'default' : 'outline'}
                      onClick={() => setCategoryFilter(f => f.includes(cat) ? f.filter(c => c !== cat) : [...f, cat])}
                    >
                      {getCategoryInfo(cat).label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium text-sm">Status:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Button size="sm" variant={paymentFilter === 'all' ? 'default' : 'outline'} onClick={() => setPaymentFilter('all')}>Todas</Button>
                  <Button size="sm" variant={paymentFilter === 'paid' ? 'default' : 'outline'} onClick={() => setPaymentFilter('paid')}>Pagas</Button>
                  <Button size="sm" variant={paymentFilter === 'unpaid' ? 'default' : 'outline'} onClick={() => setPaymentFilter('unpaid')}>Não Pagas</Button>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="ghost" onClick={() => {
                  setPeriod('7d');
                  setDateRange({ start: null, end: null });
                  setCategoryFilter([]);
                  setPaymentFilter('all');
                }}>Limpar Filtros</Button>
              </div>
            </PopoverContent>
          </Popover>
          {/* Resumo dos filtros ativos */}
          <div className="text-xs text-gray-500 flex flex-wrap gap-2">
            <span>Período: {periodOptions.find(p => p.key === period)?.label || ''}</span>
            {period === 'custom' && dateRange.start && dateRange.end && (
              <span>{format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}</span>
            )}
            {categoryFilter.length > 0 && (
              <span>Categorias: {categoryFilter.map(cat => getCategoryInfo(cat).label).join(', ')}</span>
            )}
            {paymentFilter !== 'all' && (
              <span>Status: {paymentFilter === 'paid' ? 'Pagas' : 'Não Pagas'}</span>
            )}
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MoreHorizontal className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            Nenhuma transação encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Ajuste os filtros ou adicione transações para visualizar aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Painel de Filtros */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px]">
            <div className="mb-2">
              <span className="font-medium text-sm">Período:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {periodOptions.map(opt => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={period === opt.key ? 'default' : 'outline'}
                    onClick={() => setPeriod(opt.key as any)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            {period === 'custom' && (
              <div className="mb-2">
                <span className="font-medium text-sm">Data inicial e final:</span>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    className="flex-1 justify-start"
                    onClick={() => {
                      const d = prompt('Digite a data inicial (AAAA-MM-DD):');
                      if (d) setDateRange(r => ({ ...r, start: new Date(d) }));
                    }}
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {dateRange.start ? format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 'Início'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start"
                    onClick={() => {
                      const d = prompt('Digite a data final (AAAA-MM-DD):');
                      if (d) setDateRange(r => ({ ...r, end: new Date(d) }));
                    }}
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {dateRange.end ? format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 'Fim'}
                  </Button>
                </div>
              </div>
            )}
            <div className="mb-2">
              <span className="font-medium text-sm">Categorias:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={categoryFilter.includes(cat) ? 'default' : 'outline'}
                    onClick={() => setCategoryFilter(f => f.includes(cat) ? f.filter(c => c !== cat) : [...f, cat])}
                  >
                    {getCategoryInfo(cat).label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <span className="font-medium text-sm">Status:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <Button size="sm" variant={paymentFilter === 'all' ? 'default' : 'outline'} onClick={() => setPaymentFilter('all')}>Todas</Button>
                <Button size="sm" variant={paymentFilter === 'paid' ? 'default' : 'outline'} onClick={() => setPaymentFilter('paid')}>Pagas</Button>
                <Button size="sm" variant={paymentFilter === 'unpaid' ? 'default' : 'outline'} onClick={() => setPaymentFilter('unpaid')}>Não Pagas</Button>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button size="sm" variant="ghost" onClick={() => {
                setPeriod('7d');
                setDateRange({ start: null, end: null });
                setCategoryFilter([]);
                setPaymentFilter('all');
              }}>Limpar Filtros</Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* Resumo dos filtros ativos */}
        <div className="text-xs text-gray-500 flex flex-wrap gap-2">
          <span>Período: {periodOptions.find(p => p.key === period)?.label || ''}</span>
          {period === 'custom' && dateRange.start && dateRange.end && (
            <span>{format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}</span>
          )}
          {categoryFilter.length > 0 && (
            <span>Categorias: {categoryFilter.map(cat => getCategoryInfo(cat).label).join(', ')}</span>
          )}
          {paymentFilter !== 'all' && (
            <span>Status: {paymentFilter === 'paid' ? 'Pagas' : 'Não Pagas'}</span>
          )}
        </div>
      </div>
      {/* Lista de transações */}
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MoreHorizontal className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            Nenhuma transação encontrada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Ajuste os filtros ou adicione transações para visualizar aqui
          </p>
        </div>
      ) : (
        sortedTransactions.map((transaction) => {
          const categoryInfo = getCategoryInfo(transaction.category);
          const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap];
          return (
            <Card key={transaction.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${categoryInfo.color}20` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: categoryInfo.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          transaction.isPaid 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {transaction.description}
                          {transaction.type === 'expense' && (
                            <span className="ml-2">
                              {transaction.isPaid ? (
                                <Check className="w-4 h-4 inline text-green-600" />
                              ) : (
                                <X className="w-4 h-4 inline text-red-600" />
                              )}
                            </span>
                          )}
                        </h3>
                        <span className={`font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : transaction.isPaid
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: categoryInfo.color,
                              color: categoryInfo.color 
                            }}
                          >
                            {categoryInfo.label}
                          </Badge>
                          <span>
                            {new Date(transaction.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {transaction.type === 'expense' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateTransaction(transaction.id, { isPaid: !transaction.isPaid })}
                            >
                              {transaction.isPaid ? <X className="w-4 h-4 text-gray-500" /> : <Check className="w-4 h-4 text-green-500" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setEditingTransaction(transaction)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteTransaction(transaction.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
      {editingTransaction && (
        <EditTransactionForm
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionList;
