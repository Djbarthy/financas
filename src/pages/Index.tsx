
import React from 'react';
import { FinancialProvider } from '@/contexts/FinancialContext';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Dashboard />
      </div>
    </FinancialProvider>
  );
};

export default Index;
