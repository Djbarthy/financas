import React, { useState, useEffect, useRef } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { TransactionCategory } from '@/types/financial';
import { getCategoryInfo } from '@/utils/categories';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import ProgressIndicator from './ProgressIndicator';
import TransactionTypeStep from './TransactionTypeStep';
import DateSelectionStep from './DateSelectionStep';
import AmountCategoryStep from './AmountCategoryStep';
import ConfirmationStep from './ConfirmationStep';
import CarouselNavigation from './CarouselNavigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionCarouselProps {
  onClose: () => void;
}

const animatedTexts = ["Pix para o Carlos", "Vale alimentação", "Salário", "Aluguel", "Cinema"];

const TransactionNameStep: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const [placeholder, setPlaceholder] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    if (hasInteracted || value) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPlaceholder('Ex: Jantar, Gasolina, Presente...');
      return;
    }

    const type = () => {
      const currentText = animatedTexts[textIndex.current];
      let newPlaceholder = '';
      let timeout = 120;

      if (isDeleting.current) {
        newPlaceholder = currentText.substring(0, charIndex.current - 1);
        charIndex.current--;
        timeout = 80;
      } else {
        newPlaceholder = currentText.substring(0, charIndex.current + 1);
        charIndex.current++;
      }

      setPlaceholder(newPlaceholder);

      if (!isDeleting.current && charIndex.current === currentText.length) {
        timeout = 1500;
        isDeleting.current = true;
      } else if (isDeleting.current && charIndex.current === 0) {
        isDeleting.current = false;
        textIndex.current = (textIndex.current + 1) % animatedTexts.length;
        timeout = 500;
      }
      
      timeoutRef.current = setTimeout(type, timeout);
    };

    timeoutRef.current = setTimeout(type, 500);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hasInteracted, value]);

  return (
    <div className="text-center p-4 space-y-6">
      <h3 className="text-2xl font-bold text-brand-primary">Nome da Transação</h3>
      <div className="max-w-md mx-auto">
        <Input
          id="description"
          placeholder={value ? '' : placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={handleInteraction}
          className="text-lg text-center h-14 font-medium border-2 border-brand-primary"
          maxLength={60}
          required
        />
      </div>
    </div>
  );
};

const TransactionCarousel: React.FC<TransactionCarouselProps> = ({ onClose }) => {
  const { activeWallet, addTransaction } = useFinancial();
  const { formData, updateFormData, resetFormExceptType, isFormValid } = useTransactionForm();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  // Validação por etapa
  const isStepValid = () => {
    if (currentStep === 0) return !!formData.type;
    if (currentStep === 1) return !!formData.description && formData.description.length > 0;
    if (currentStep === 2) return !!formData.date;
    if (currentStep === 3) return formData.amount && parseFloat(formData.amount) > 0 && !!formData.category;
    if (currentStep === 4) return isFormValid();
    return false;
  };

  // Navegação
  const goToNextStep = (type?: 'income' | 'expense') => {
    const isTypeValid = type ? !!type : !!formData.type;
    const isStepValid_ = currentStep === 0 ? isTypeValid : isStepValid();
    
    if (currentStep < totalSteps - 1 && isStepValid_) {
      setCurrentStep((s) => s + 1);
    }
  };
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Handlers de cada etapa
  const handleTypeSelect = (type: 'income' | 'expense') => {
    if (formData.type !== type) {
      updateFormData({ type });
      resetFormExceptType();
    } else {
      updateFormData({ type });
    }
    // Avançar automaticamente para a próxima etapa
    if (currentStep === 0) {
      goToNextStep(type);
    }
  };
  const handleNameChange = (value: string) => {
    updateFormData({ description: value });
  };
  const handleDateSelect = (date: Date | undefined) => {
    if (date) updateFormData({ date });
  };
  const handleCategorySelect = (category: TransactionCategory) => {
    updateFormData({ category });
  };
  const handleAmountChange = (value: string) => {
    updateFormData({ amount: value });
  };

  // Submissão
  const handleSubmit = () => {
    if (!activeWallet || !isFormValid()) return;
    addTransaction({
      walletId: activeWallet.id,
      amount: parseFloat(formData.amount) / 100,
      type: formData.type!,
      date: formData.date,
      description: formData.description || `${formData.type === 'income' ? 'Receita' : 'Despesa'} - ${getCategoryInfo(formData.category).label}`,
      category: formData.category,
      isPaid: true,
    });
    onClose();
  };

  // Renderização condicional de cada etapa
  let stepContent = null;
  if (currentStep === 0) {
    stepContent = <TransactionTypeStep onTypeSelect={handleTypeSelect} />;
  } else if (currentStep === 1) {
    stepContent = <TransactionNameStep value={formData.description} onChange={handleNameChange} />;
  } else if (currentStep === 2) {
    stepContent = <DateSelectionStep selectedDate={formData.date} onDateSelect={handleDateSelect} />;
  } else if (currentStep === 3) {
    stepContent = <AmountCategoryStep amount={formData.amount} selectedCategory={formData.category} onAmountChange={handleAmountChange} onCategorySelect={handleCategorySelect} />;
  } else if (currentStep === 4) {
    stepContent = <ConfirmationStep formData={formData} onSubmit={handleSubmit} isSubmitDisabled={!isFormValid()} />;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[80vh] overflow-hidden p-0 bg-white rounded-lg shadow-xl border">
        <DialogTitle className="sr-only">Nova Transação</DialogTitle>
        <DialogDescription className="sr-only">Formulário para criar uma nova transação financeira</DialogDescription>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 px-6 py-4 min-h-0 flex items-center justify-center">
            <div className="w-full max-w-lg">{stepContent}</div>
          </div>
          <div className="px-6 pb-2">
            <CarouselNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={goToPreviousStep}
              onNext={goToNextStep}
              onSubmit={handleSubmit}
              onClose={onClose}
              isSubmitDisabled={!isFormValid()}
              isStepValid={isStepValid()}
            />
            <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionCarousel;
