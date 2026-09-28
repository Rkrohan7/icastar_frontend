import React from 'react'
import { useTranslation } from '@/i18n'

interface ProfileCompletionBarProps {
    percentage: number
}

export const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({
    percentage,
}) => {
    const { t } = useTranslation()
    // Determine color and label based on percentage
    let colorClass = 'bg-red-500'
    let label = t('profileCompletion.levels.incomplete')
    let textColorClass = 'text-red-700'
    let bgColorClass = 'bg-red-100'

    if (percentage >= 90) {
        colorClass = 'bg-green-500'
        label = t('profileCompletion.levels.excellent')
        textColorClass = 'text-green-700'
        bgColorClass = 'bg-green-100'
    } else if (percentage >= 70) {
        colorClass = 'bg-yellow-500'
        label = t('profileCompletion.levels.goodProgress')
        textColorClass = 'text-yellow-700'
        bgColorClass = 'bg-yellow-100'
    } else if (percentage >= 50) {
        colorClass = 'bg-orange-500'
        label = t('profileCompletion.levels.fair')
        textColorClass = 'text-orange-700'
        bgColorClass = 'bg-orange-100'
    }

    return (
        <div className='mt-4 w-full'>
            <div className='flex justify-between items-center mb-2'>
                <span className='text-sm font-medium text-gray-700'>
                    {t('profileCompletion.title')}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgColorClass} ${textColorClass}`}>
                    {percentage}% {percentage >= 50 ? '⚠️ ' : ''}{label}
                </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2.5'>
                <div
                    className={`h-2.5 rounded-full ${colorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    )
}
