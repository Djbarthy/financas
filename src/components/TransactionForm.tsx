import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { TransactionCategory } from '@/types/financial';
import { getCategoryInfo } from '@/utils/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Home, 
  UtensilsCrossed, 
  Gamepad2, 
  CreditCard, 
  Car, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TransactionFormProps {
  onClose: () => void;
}

const iconMap = {
  Home,
  UtensilsCrossed,
  Gamepad2,
  CreditCard,
  Car,
  Heart,
  MoreHorizontal,
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose }) => {
  const { activeWallet, addTransaction } = useFinancial();
  
  // Fix date initialization to ensure proper timezone handling
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
  const todayString = localDate.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: todayString,
    description: '',
    category: 'other' as TransactionCategory,
  });

  // Função para formatar valor digitado como moeda
  const formatCurrencyInput = (value: string) => {
    // Remove tudo que não for número
    const onlyNumbers = value.replace(/\D/g, '');
    // Converte para centavos
    const cents = parseInt(onlyNumbers, 10);
    if (isNaN(cents)) return '';
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para manipular o input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove tudo que não for número
    const onlyNumbers = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, amount: onlyNumbers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWallet || !formData.amount || !formData.description) {
      return;
    }

    try {
      await addTransaction({
        walletId: activeWallet.id,
        amount: parseFloat(formData.amount) / 100,
        type: formData.type,
        date: new Date(formData.date + 'T12:00:00.000Z'),
        description: formData.description,
        category: formData.category,
        isPaid: true,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Não foi possível criar a transação. Tente novamente.');
    }
  };

  const categories: TransactionCategory[] = [
    'fixed', 'food', 'leisure', 'debt', 'transport', 'health', 'uber', 'other'
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-primary">
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da transação"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={formatCurrencyInput(formData.amount)}
                onChange={handleAmountChange}
                required
                maxLength={12}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value: TransactionCategory) => 
                setFormData(prev => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const categoryInfo = getCategoryInfo(category);
                  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap];
                  
                  return (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: categoryInfo.color }}
                        />
                        <span>{categoryInfo.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-rose-earthy hover:bg-brand-rose-light"
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
