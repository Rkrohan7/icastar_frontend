import React from 'react';
import { Job } from '../types';
import { PricingCard, PricingCardProps } from './PricingCard';
import { useTranslation } from '@/i18n';

// Display text for each plan lives in i18n/locales/boostJobModal.ts under plans.<id>.
const boostJobPlans: { id: 'single' | 'power' | 'pack'; price: string; recommended?: boolean }[] = [
  { id: 'single', price: '$49' },
  { id: 'power', price: '$129', recommended: true },
  { id: 'pack', price: '$299' },
];

const PLAN_FEATURE_KEYS = ['feature1', 'feature2', 'feature3'];

interface BoostJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBoost: (jobId: number) => void;
    jobToBoost: Job | null;
}

export const BoostJobModal: React.FC<BoostJobModalProps> = ({ isOpen, onClose, onBoost, jobToBoost }) => {
    const { t } = useTranslation();
    if (!isOpen || !jobToBoost) return null;

    const plans: (Omit<PricingCardProps, 'onSelect'> & { id: string })[] = boostJobPlans.map(plan => ({
        id: plan.id,
        planName: t(`boostJobModal.plans.${plan.id}.name`),
        price: plan.price,
        description: t(`boostJobModal.plans.${plan.id}.description`),
        features: PLAN_FEATURE_KEYS.map(key => t(`boostJobModal.plans.${plan.id}.features.${key}`)),
        buttonText: t(`boostJobModal.plans.${plan.id}.button`),
        recommended: plan.recommended,
    }));

    const handleSelectPlan = () => {
        onBoost(jobToBoost.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{t('boostJobModal.title', { title: jobToBoost.title })}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-8 overflow-y-auto">
                    <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">{t('boostJobModal.intro')}</p>
                    <div className="mt-8 max-w-5xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
                       {plans.map(({ id, ...plan }) => (
                            <PricingCard
                                key={id}
                                {...plan}
                                onSelect={handleSelectPlan}
                            />
                        ))}
                    </div>
                </div>
                 <div className="flex justify-end items-center p-6 border-t space-x-3 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {t('common.actions.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};