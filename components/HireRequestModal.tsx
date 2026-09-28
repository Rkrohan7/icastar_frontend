import React, { useState, useEffect } from 'react';
import { Artist, Job } from '../types';
import { useTranslation } from '@/i18n';

interface HireRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendRequest: (jobId: string, message: string) => void;
    artist: Artist | null;
    jobs: Job[];
}

export const HireRequestModal: React.FC<HireRequestModalProps> = ({ isOpen, onClose, onSendRequest, artist, jobs }) => {
    const { t, tEnum } = useTranslation();
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Pre-select the first active job if available
        if (jobs.length > 0) {
            setSelectedJobId(jobs[0].id.toString());
        }
        // Reset message when modal opens
        setMessage(t('hireRequestModal.defaultMessage', { firstName: artist?.name.split(' ')[0] ?? '' }));
    }, [isOpen, jobs, artist, t]);

    if (!isOpen || !artist) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJobId) {
            alert(t('hireRequestModal.selectJobAlert'));
            return;
        }
        onSendRequest(selectedJobId, message);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{t('hireRequestModal.title', { name: artist.name })}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form id="hire-request-form" onSubmit={handleFormSubmit} className="overflow-y-auto">
                    <div className="p-8 space-y-6">
                        <div>
                            <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">{t('hireRequestModal.selectJobLabel')}</label>
                            <select
                                id="jobId"
                                name="jobId"
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5 pr-10"
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                required
                            >
                                {jobs.length > 0 ? (
                                    jobs.map(job => (
                                        <option key={job.id} value={job.id}>
                                            {job.title} ({tEnum(job.type)})
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>{t('hireRequestModal.noActiveJobs')}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">{t('hireRequestModal.messageLabel')}</label>
                            <div className="mt-1">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={8}
                                    className="block w-full rounded-lg border-gray-300 bg-white shadow-sm transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm px-3 py-2.5"
                                    placeholder={t('hireRequestModal.messagePlaceholder')}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="flex justify-end items-center p-6 border-t space-x-3 bg-gray-50 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {t('common.actions.cancel')}
                    </button>
                    <button
                        type="submit"
                        form="hire-request-form"
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        disabled={jobs.length === 0}
                    >
                        {t('hireRequestModal.sendRequest')}
                    </button>
                </div>
            </div>
        </div>
    );
};
