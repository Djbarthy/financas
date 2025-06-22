import React from 'react';
import { CategoryInfo, TransactionCategory } from '@/types/financial';
import { 
  Home, 
  UtensilsCrossed, 
  Gamepad2, 
  CreditCard, 
  Car, 
  Heart, 
  MoreHorizontal 
} from 'lucide-react';

export const CATEGORIES: Record<TransactionCategory, CategoryInfo> = {
  fixed: {
    key: 'fixed',
    label: 'Fixo',
    icon: 'Home',
    color: '#4d4250'
  },
  food: {
    key: 'food',
    label: 'Comida',
    icon: 'UtensilsCrossed',
    color: '#b66e6f'
  },
  leisure: {
    key: 'leisure',
    label: 'Lazer',
    icon: 'Gamepad2',
    color: '#cf8884'
  },
  debt: {
    key: 'debt',
    label: 'Dívidas',
    icon: 'CreditCard',
    color: '#e6a972'
  },
  transport: {
    key: 'transport',
    label: 'Transporte',
    icon: 'Car',
    color: '#f6d169'
  },
  health: {
    key: 'health',
    label: 'Saúde',
    icon: 'Heart',
    color: '#b66e6f'
  },
  uber: {
    key: 'uber',
    label: 'Uber',
    icon: 'UberLogo',
    color: '#000000'
  },
  other: {
    key: 'other',
    label: 'Outros',
    icon: 'MoreHorizontal',
    color: '#4d4250'
  }
};

export const getCategoryInfo = (category: TransactionCategory): CategoryInfo => {
  if (category === 'uber') {
    return {
      key: 'uber',
      label: 'Uber',
      icon: 'UberLogo',
      color: '#000000'
    };
  }
  return CATEGORIES[category] || CATEGORIES.other;
};

export const getCategoryColor = (category: TransactionCategory): string => {
  return CATEGORIES[category].color;
};

export const UberLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 32 32" width={20} height={20} {...props}>
    <circle cx="16" cy="16" r="16" fill="#000" />
    <rect x="10" y="15" width="12" height="2" rx="1" fill="#fff" />
    <circle cx="16" cy="16" r="3" fill="#fff" />
  </svg>
);
