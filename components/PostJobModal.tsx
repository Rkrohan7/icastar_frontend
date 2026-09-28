
import React, { useState, useEffect } from 'react';
import { CastingCharacter, Job } from '../types';
import { ProjectCastingFields, ProjectCastingValue } from './ProjectCastingFields';
import { useTranslation } from '@/i18n';

const InputField: React.FC<{ label: string, id: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string, required?: boolean, min?: number, error?: string }> = ({ label, id, value, onChange, type = 'text', placeholder, required = false, min, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <input
                type={type}
                name={id}
                id={id}
                min={min}
                className={`block w-full rounded-lg border bg-white shadow-sm transition placeholder:text-gray-400 focus:ring-2 sm:text-sm px-3 py-2.5 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'}`}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={onChange}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{ label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, placeholder?: string, error?: string }> = ({ label, id, value, onChange, rows = 4, placeholder, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <textarea
                id={id}
                name={id}
                rows={rows}
                className={`block w-full rounded-lg border bg-white shadow-sm transition placeholder:text-gray-400 focus:ring-2 sm:text-sm px-3 py-2.5 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const SelectField: React.FC<{
    label: string
    id: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    children: React.ReactNode
    error?: string
}> = ({ label, id, value, onChange, children, error }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <select
                id={id}
                name={id}
                className={`block w-full rounded-lg border bg-white shadow-sm transition focus:ring-2 sm:text-sm px-3 py-2.5 pr-10 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-primary/20'}`}
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const CheckboxField: React.FC<{
    label: string
    id: string
    checked: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    description?: string
}> = ({ label, id, checked, onChange, description }) => (
    <div className="relative flex items-start">
        <div className="flex h-5 items-center">
            <input
                id={id}
                name={id}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={checked}
                onChange={onChange}
            />
        </div>
        <div className="ml-3 text-sm">
            <label htmlFor={id} className="font-medium text-gray-700">{label}</label>
            {description && <p className="text-gray-500">{description}</p>}
        </div>
    </div>
);


interface PostJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Job) => void;
    jobToEdit: Job | null;
    // Pre-selects a project when adding a job from the project view
    defaultProject?: { projectId: number; projectName: string; projectType?: Job['projectType'] } | null;
}

// Values are translation keys; they are translated when rendered
interface FormErrors {
    projectId?: string;
    characterId?: string;
    title?: string;
    description?: string;
    requirements?: string;
    skills?: string;
    location?: string;
    budgetMin?: string;
    budgetMax?: string;
    durationDays?: string;
    applicationDeadline?: string;
}

const emptyJob: Partial<Job> = {
    title: '',
    type: 'Full-time',
    description: '',
    skills: '',
    experienceLevel: 'Entry Level',
    isRemote: false,
    currency: 'USD',
    isUrgent: false,
    roleType: 'SUPPORTING',
};

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onSave, jobToEdit, defaultProject }) => {
    const { t, tEnum } = useTranslation();
    const [formData, setFormData] = useState<Partial<Job>>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [addedCount, setAddedCount] = useState(0);
    // A job can either belong to a casting project or stand on its own
    const [isProjectJob, setIsProjectJob] = useState(true);

    useEffect(() => {
        if (jobToEdit) {
            setFormData(jobToEdit);
        } else {
            setFormData({ ...emptyJob, ...(defaultProject ?? {}) });
        }
        setErrors({});
        setAddedCount(0);
        // Editing keeps whatever the job already is; new jobs default to project casting
        setIsProjectJob(jobToEdit ? !!jobToEdit.projectId : true);
    }, [jobToEdit, isOpen, defaultProject]);

    if (!isOpen) return null;

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (isProjectJob) {
            if (!formData.projectId) {
                newErrors.projectId = 'postJobModal.errors.projectRequired';
            }
            if (!formData.characterId) {
                newErrors.characterId = 'postJobModal.errors.characterRequired';
            }
        }
        if (!formData.title?.trim()) {
            newErrors.title = 'postJobModal.errors.titleRequired';
        }
        if (!formData.description?.trim()) {
            newErrors.description = 'postJobModal.errors.descriptionRequired';
        }
        if (!formData.requirements?.trim()) {
            newErrors.requirements = 'postJobModal.errors.requirementsRequired';
        }
        if (!formData.skills?.trim()) {
            newErrors.skills = 'postJobModal.errors.skillsRequired';
        }
        if (!formData.isRemote && !formData.location?.trim()) {
            newErrors.location = 'postJobModal.errors.locationRequired';
        }
        if (formData.budgetMin === undefined || formData.budgetMin === null || String(formData.budgetMin) === '') {
            newErrors.budgetMin = 'postJobModal.errors.budgetMinRequired';
        }
        if (formData.budgetMax === undefined || formData.budgetMax === null || String(formData.budgetMax) === '') {
            newErrors.budgetMax = 'postJobModal.errors.budgetMaxRequired';
        }
        if (formData.durationDays === undefined || formData.durationDays === null || String(formData.durationDays) === '') {
            newErrors.durationDays = 'postJobModal.errors.durationRequired';
        }
        if (!formData.applicationDeadline?.trim()) {
            newErrors.applicationDeadline = 'postJobModal.errors.deadlineRequired';
        }

        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            const numVal = value === '' ? undefined : parseFloat(value);
            setFormData(prev => ({ ...prev, [name]: numVal }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error for the field being changed
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleCastingChange = (next: ProjectCastingValue, character?: CastingCharacter) => {
        setFormData(prev => {
            const updated: Partial<Job> = { ...prev, ...next };
            // Prefill an empty description from the character brief (title is always typed by the recruiter)
            if (character && next.characterId !== prev.characterId) {
                if (!prev.description?.trim() && character.description) {
                    updated.description = character.description;
                }
            }
            return updated;
        });
        setErrors(prev => ({ ...prev, projectId: undefined, characterId: undefined }));
    };

    const submit = (addNext: boolean) => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        // Standalone jobs carry no casting data; undefined tells the page to unlink on edit
        const payload: Job = (isProjectJob
            ? formData
            : {
                ...formData,
                projectId: undefined,
                projectName: undefined,
                projectType: undefined,
                characterId: undefined,
                characterName: undefined,
                roleType: undefined,
            }) as Job;
        onSave(payload);
        if (!addNext) {
            onClose();
            return;
        }
        // Keep project + shared production details, clear character-specific fields
        setFormData(prev => ({
            ...emptyJob,
            projectId: prev.projectId,
            projectName: prev.projectName,
            projectType: prev.projectType,
            type: prev.type,
            experienceLevel: prev.experienceLevel,
            isRemote: prev.isRemote,
            location: prev.location,
            currency: prev.currency,
            budgetMin: prev.budgetMin,
            budgetMax: prev.budgetMax,
            durationDays: prev.durationDays,
            applicationDeadline: prev.applicationDeadline,
            requirements: prev.requirements,
            isUrgent: prev.isUrgent,
        }));
        setErrors({});
        setAddedCount(c => c + 1);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(false);
    };

    const isEditing = !!jobToEdit;
    const errorText = (key?: string) => (key ? t(key) : undefined);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{isEditing ? t('postJobModal.editTitle') : t('postJobModal.addTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form id="post-job-form" onSubmit={handleFormSubmit} className="overflow-y-auto">
                    <div className="p-8 space-y-8">
                        {/* Project & Casting Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">{t('postJobModal.casting.title')}</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {([
                                    [true, t('postJobModal.casting.forProject'), t('postJobModal.casting.forProjectHint')],
                                    [false, t('postJobModal.casting.standalone'), t('postJobModal.casting.standaloneHint')],
                                ] as const).map(([mode, label, hint]) => (
                                    <button
                                        key={String(mode)}
                                        type="button"
                                        title={hint}
                                        onClick={() => setIsProjectJob(mode)}
                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                            isProjectJob === mode
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {isProjectJob ? (
                                <>
                                    {addedCount > 0 && (
                                        <p className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-800">
                                            {t('postJobModal.casting.addedToProject', { count: addedCount, project: formData.projectName ?? '' })}
                                        </p>
                                    )}
                                    <p className="mb-4 text-xs text-gray-500">
                                        {t('postJobModal.casting.privacyNote')}
                                    </p>
                                    <ProjectCastingFields
                                        value={{
                                            projectId: formData.projectId,
                                            projectName: formData.projectName,
                                            projectType: formData.projectType,
                                            characterId: formData.characterId,
                                            characterName: formData.characterName,
                                            roleType: formData.roleType,
                                        }}
                                        onChange={handleCastingChange}
                                        errors={{ projectId: errorText(errors.projectId), characterId: errorText(errors.characterId) }}
                                    />
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    {t('postJobModal.casting.standaloneNote')}
                                    {jobToEdit?.projectId && ' ' + t('postJobModal.casting.removesFromProject', { project: jobToEdit.projectName ?? '' })}
                                </p>
                            )}
                        </div>

                        {/* Job Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">{t('postJobModal.details.title')}</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <InputField label={t('postJobModal.details.jobTitle')} id="title" placeholder={t('postJobModal.details.jobTitlePlaceholder')} value={formData.title || ''} onChange={handleChange} error={errorText(errors.title)} />
                                </div>
                                <div className="sm:col-span-1">
                                    <SelectField label={t('postJobModal.details.jobType')} id="type" value={formData.type || 'Full-time'} onChange={handleChange}>
                                        <option value="Full-time">{t('postJobModal.jobTypes.fullTime')}</option>
                                        <option value="Part-time">{t('postJobModal.jobTypes.partTime')}</option>
                                        <option value="Contract">{t('postJobModal.jobTypes.contract')}</option>
                                        <option value="Freelance">{t('postJobModal.jobTypes.freelance')}</option>
                                    </SelectField>
                                </div>
                                <div className="sm:col-span-1">
                                    <SelectField label={t('postJobModal.details.experienceLevel')} id="experienceLevel" value={formData.experienceLevel || 'Entry Level'} onChange={handleChange}>
                                        <option value="Entry Level">{tEnum('ENTRY_LEVEL')}</option>
                                        <option value="Mid Level">{tEnum('MID_LEVEL')}</option>
                                        <option value="Senior Level">{tEnum('SENIOR_LEVEL')}</option>
                                        <option value="Director">{tEnum('DIRECTOR')}</option>
                                        <option value="Executive">{tEnum('EXECUTIVE')}</option>
                                    </SelectField>
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center gap-6">
                                        <CheckboxField
                                            label={t('postJobModal.details.remote')}
                                            id="isRemote"
                                            checked={formData.isRemote || false}
                                            onChange={handleChange}
                                            description={t('postJobModal.details.remoteDescription')}
                                        />

                                        {!formData.isRemote && (
                                            <div className="flex-1">
                                                <InputField label={t('common.labels.location')} id="location" placeholder={t('postJobModal.details.locationPlaceholder')} value={formData.location || ''} onChange={handleChange} error={errorText(errors.location)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">{t('postJobModal.description.title')}</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                                <div>
                                    <TextAreaField label={t('postJobModal.description.jobDescription')} id="description" placeholder={t('postJobModal.description.jobDescriptionPlaceholder')} value={formData.description || ''} onChange={handleChange} error={errorText(errors.description)} />
                                </div>
                                <div>
                                    <TextAreaField label={t('postJobModal.description.requirements')} id="requirements" placeholder={t('postJobModal.description.requirementsPlaceholder')} value={formData.requirements || ''} onChange={handleChange} error={errorText(errors.requirements)} />
                                </div>
                            </div>
                        </div>

                        {/* Skills & Compensation Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">{t('postJobModal.compensation.title')}</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <InputField label={t('postJobModal.compensation.skills')} id="skills" placeholder={t('postJobModal.compensation.skillsPlaceholder')} value={formData.skills || ''} onChange={handleChange} error={errorText(errors.skills)} />
                                </div>

                                <div className="sm:col-span-2">
                                    <SelectField label={t('postJobModal.compensation.currency')} id="currency" value={formData.currency || 'USD'} onChange={handleChange}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </SelectField>
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField label={t('postJobModal.compensation.budgetMin')} id="budgetMin" type="number" placeholder={t('postJobModal.compensation.min')} value={formData.budgetMin ?? ''} onChange={handleChange} min={0} error={errorText(errors.budgetMin)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField label={t('postJobModal.compensation.budgetMax')} id="budgetMax" type="number" placeholder={t('postJobModal.compensation.max')} value={formData.budgetMax ?? ''} onChange={handleChange} min={0} error={errorText(errors.budgetMax)} />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputField label={t('postJobModal.compensation.duration')} id="durationDays" type="number" placeholder={t('postJobModal.compensation.durationPlaceholder')} value={formData.durationDays ?? ''} onChange={handleChange} min={1} error={errorText(errors.durationDays)} />
                                </div>
                            </div>
                        </div>

                        {/* Hiring Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">{t('postJobModal.hiring.title')}</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                                <div className="sm:col-span-2">
                                    <InputField label={t('postJobModal.hiring.deadline')} id="applicationDeadline" type="date" value={formData.applicationDeadline || ''} onChange={handleChange} error={errorText(errors.applicationDeadline)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <CheckboxField
                                        label={t('postJobModal.hiring.urgent')}
                                        id="isUrgent"
                                        checked={formData.isUrgent || false}
                                        onChange={handleChange}
                                        description={t('postJobModal.hiring.urgentDescription')}
                                    />
                                </div>
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
                        {addedCount > 0 ? t('common.actions.done') : t('common.actions.cancel')}
                    </button>
                    {!isEditing && isProjectJob && (
                        <button
                            type="button"
                            onClick={() => submit(true)}
                            className="px-6 py-2.5 border border-primary rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                        >
                            {t('postJobModal.footer.saveAndAddNext')}
                        </button>
                    )}
                    <button
                        type="submit"
                        form="post-job-form"
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {isEditing ? t('common.actions.saveChanges') : t('postJobModal.addJob')}
                    </button>
                </div>
            </div>
        </div>
    );
};
