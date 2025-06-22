
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

export const getDaysUntil = (date: Date): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isTransactionInPeriod = (transactionDate: Date, period: string): boolean => {
  const today = new Date();
  const transaction = new Date(transactionDate);
  
  switch (period) {
    case '7d':
      return (today.getTime() - transaction.getTime()) <= (7 * 24 * 60 * 60 * 1000);
    case '15d':
      return (today.getTime() - transaction.getTime()) <= (15 * 24 * 60 * 60 * 1000);
    case '30d':
      return (today.getTime() - transaction.getTime()) <= (30 * 24 * 60 * 60 * 1000);
    default:
      return true;
  }
};
