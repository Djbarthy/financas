import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface CarouselNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitDisabled?: boolean;
  isStepValid?: boolean;
}

const CarouselNavigation: React.FC<CarouselNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onClose,
  isSubmitDisabled = false,
  isStepValid = false,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between items-center gap-4">
      {/* Botão esquerdo — cancelar ou voltar */}
      <Button variant="outline" onClick={isFirst ? onClose : onBack}>
        {isFirst ? 'Cancelar' : 'Voltar'}
      </Button>

      {/* Botão direito — avançar ou salvar */}
      <Button
        onClick={isLast ? onSubmit : onNext}
        disabled={isLast ? isSubmitDisabled : !isStepValid}
      >
        {isLast ? 'Salvar' : 'Avançar'}
      </Button>
    </div>
  );
};

export default CarouselNavigation;
