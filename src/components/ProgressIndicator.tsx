
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentStep ? 'bg-brand-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
