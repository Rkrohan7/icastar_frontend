
import React, { useState, useEffect } from 'react';
import { CastingCharacter, Job } from '../types';
import { ProjectCastingFields, ProjectCastingValue } from './ProjectCastingFields';

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
    const [formData, setFormData] = useState<Partial<Job>>({});
    const [errors, setErrors] = useState<FormErrors>({});
    const [addedCount, setAddedCount] = useState(0);

    useEffect(() => {
        if (jobToEdit) {
            setFormData(jobToEdit);
        } else {
            setFormData({ ...emptyJob, ...(defaultProject ?? {}) });
        }
        setErrors({});
        setAddedCount(0);
    }, [jobToEdit, isOpen, defaultProject]);

    if (!isOpen) return null;

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!formData.projectId) {
            newErrors.projectId = 'Project is required';
        }
        if (!formData.characterId) {
            newErrors.characterId = 'Casting character is required';
        }
        if (!formData.title?.trim()) {
            newErrors.title = 'Job Title is required';
        }
        if (!formData.description?.trim()) {
            newErrors.description = 'Job Description is required';
        }
        if (!formData.requirements?.trim()) {
            newErrors.requirements = 'Requirements is required';
        }
        if (!formData.skills?.trim()) {
            newErrors.skills = 'Required Skills is required';
        }
        if (!formData.isRemote && !formData.location?.trim()) {
            newErrors.location = 'Location is required';
        }
        if (formData.budgetMin === undefined || formData.budgetMin === null || String(formData.budgetMin) === '') {
            newErrors.budgetMin = 'Budget Min is required';
        }
        if (formData.budgetMax === undefined || formData.budgetMax === null || String(formData.budgetMax) === '') {
            newErrors.budgetMax = 'Budget Max is required';
        }
        if (formData.durationDays === undefined || formData.durationDays === null || String(formData.durationDays) === '') {
            newErrors.durationDays = 'Contract Duration is required';
        }
        if (!formData.applicationDeadline?.trim()) {
            newErrors.applicationDeadline = 'Application Deadline is required';
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
        onSave(formData as Job);
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10" aria-labelledby="modal-title" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Job' : 'Add New Job'}</h2>
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
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">Project & Casting</h3>
                            {addedCount > 0 && (
                                <p className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-800">
                                    {addedCount} job{addedCount > 1 ? 's' : ''} added to {formData.projectName}. Pick the next character.
                                </p>
                            )}
                            <p className="mb-4 text-xs text-gray-500">
                                Project details are private to you. Artists only see the job title, description and requirements.
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
                                errors={{ projectId: errors.projectId, characterId: errors.characterId }}
                            />
                        </div>

                        {/* Job Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">Job Details</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <InputField label="Job Title" id="title" placeholder="e.g., Senior Product Designer" value={formData.title || ''} onChange={handleChange} error={errors.title} />
                                </div>
                                <div className="sm:col-span-1">
                                    <SelectField label="Job Type" id="type" value={formData.type || 'Full-time'} onChange={handleChange}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Freelance</option>
                                    </SelectField>
                                </div>
                                <div className="sm:col-span-1">
                                    <SelectField label="Experience Level" id="experienceLevel" value={formData.experienceLevel || 'Entry Level'} onChange={handleChange}>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Mid Level">Mid Level</option>
                                        <option value="Senior Level">Senior Level</option>
                                        <option value="Director">Director</option>
                                        <option value="Executive">Executive</option>
                                    </SelectField>
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center gap-6">
                                        <CheckboxField
                                            label="Remote Position"
                                            id="isRemote"
                                            checked={formData.isRemote || false}
                                            onChange={handleChange}
                                            description="This job can be performed remotely"
                                        />

                                        {!formData.isRemote && (
                                            <div className="flex-1">
                                                <InputField label="Location" id="location" placeholder="e.g., New York, NY" value={formData.location || ''} onChange={handleChange} error={errors.location} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">Description & Requirements</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                                <div>
                                    <TextAreaField label="Job Description" id="description" placeholder="Describe the role, responsibilities, and what you're looking for." value={formData.description || ''} onChange={handleChange} error={errors.description} />
                                </div>
                                <div>
                                    <TextAreaField label="Requirements" id="requirements" placeholder="List specific requirements, qualifications, and nice-to-haves." value={formData.requirements || ''} onChange={handleChange} error={errors.requirements} />
                                </div>
                            </div>
                        </div>

                        {/* Skills & Compensation Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">Skills & Compensation</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <InputField label="Required Skills" id="skills" placeholder="e.g., Figma, UI Design, Prototyping (comma-separated)" value={formData.skills || ''} onChange={handleChange} error={errors.skills} />
                                </div>

                                <div className="sm:col-span-2">
                                    <SelectField label="Currency" id="currency" value={formData.currency || 'USD'} onChange={handleChange}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                    </SelectField>
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField label="Budget Min" id="budgetMin" type="number" placeholder="Min" value={formData.budgetMin ?? ''} onChange={handleChange} min={0} error={errors.budgetMin} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField label="Budget Max" id="budgetMax" type="number" placeholder="Max" value={formData.budgetMax ?? ''} onChange={handleChange} min={0} error={errors.budgetMax} />
                                </div>

                                <div className="sm:col-span-3">
                                    <InputField label="Contract Duration (Days)" id="durationDays" type="number" placeholder="e.g., 30" value={formData.durationDays ?? ''} onChange={handleChange} min={1} error={errors.durationDays} />
                                </div>
                            </div>
                        </div>

                        {/* Hiring Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 border-b pb-2 mb-4">Hiring Details</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                                <div className="sm:col-span-2">
                                    <InputField label="Application Deadline" id="applicationDeadline" type="date" value={formData.applicationDeadline || ''} onChange={handleChange} error={errors.applicationDeadline} />
                                </div>
                                <div className="sm:col-span-2">
                                    <CheckboxField
                                        label="Urgent Hiring"
                                        id="isUrgent"
                                        checked={formData.isUrgent || false}
                                        onChange={handleChange}
                                        description="Mark this job as urgent to attract more applicants"
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
                        {addedCount > 0 ? 'Done' : 'Cancel'}
                    </button>
                    {!isEditing && (
                        <button
                            type="button"
                            onClick={() => submit(true)}
                            className="px-6 py-2.5 border border-primary rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                        >
                            Save & Add Next Character
                        </button>
                    )}
                    <button
                        type="submit"
                        form="post-job-form"
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {isEditing ? 'Save Changes' : 'Add Job'}
                    </button>
                </div>
            </div>
        </div>
    );
};
