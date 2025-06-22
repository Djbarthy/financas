
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface PaymentStatusStepProps {
  isPaid: boolean;
  onStatusChange: (checked: boolean) => void;
  onContinue: () => void;
}

const PaymentStatusStep: React.FC<PaymentStatusStepProps> = ({
  isPaid,
  onStatusChange,
  onContinue,
}) => {
  return (
    <div className="text-center space-y-6 p-4">
      <h3 className="text-2xl font-bold text-brand-primary">Status de Pagamento</h3>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4 p-6 rounded-lg bg-gray-50">
          <span className={`text-lg font-medium ${!isPaid ? 'text-gray-500' : ''}`}>
            Não paga ❌
          </span>
          <Switch
            checked={isPaid}
            onCheckedChange={onStatusChange}
            className="data-[state=checked]:bg-green-500"
          />
          <span className={`text-lg font-medium ${isPaid ? 'text-green-600' : 'text-gray-500'}`}>
            Paga ✅
          </span>
        </div>
        
        <Button
          onClick={onContinue}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default PaymentStatusStep;
