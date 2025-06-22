import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';

interface DateSelectionStepProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ 
  selectedDate, 
  onDateSelect
}) => {
  return (
    <div className="text-center space-y-6 p-4">
      <h3 className="text-2xl font-bold text-brand-primary">Data da Transação</h3>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onDateSelect(date);
          }}
          locale={ptBR}
          className="rounded-md border"
        />
      </div>
    </div>
  );
};

export default DateSelectionStep;
