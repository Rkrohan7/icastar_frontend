import React from 'react';
import { useTranslation } from '@/i18n';

const CheckIcon: React.FC = () => (
  <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export interface PricingCardProps {
  planName: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  recommended?: boolean;
  onSelect?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ planName, price, description, features, buttonText, recommended = false, onSelect }) => {
  const { t } = useTranslation();
  return (
  <div className={`bg-white border rounded-xl p-8 flex flex-col relative ${recommended ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}>
    {recommended && (
        <div className="absolute top-0 -translate-y-1/2 bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">
            {t('pricing.recommended')}
        </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900">{planName}</h3>
    <p className="mt-4 text-gray-500 text-sm">{description}</p>
    <div className="mt-6">
      <p className="text-4xl font-bold text-gray-900">{price}</p>
    </div>
    <ul role="list" className="mt-8 space-y-4 flex-grow">
      {features.map(feature => (
        <li key={feature} className="flex items-start">
          <div className="flex-shrink-0">
            <CheckIcon />
          </div>
          <p className="ml-3 text-sm text-gray-700">{feature}</p>
        </li>
      ))}
    </ul>
    <button 
        onClick={onSelect}
        className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-lg text-center font-medium ${recommended ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-primary/10 text-primary hover:bg-primary/20'} transition-colors`}
    >
      {buttonText}
    </button>
  </div>
  );
};