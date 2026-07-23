import React, { useCallback, useRef, useState } from 'react'
import {
  XIcon,
  FileTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '../../components/icons/IconComponents'
import superAdminService, {
  BulkUploadJobsResult,
} from '../../services/superAdminService'

/** Columns the backend parser expects, in order. Also drives the sample file. */
const TEMPLATE_COLUMNS = [
  'title',
  'description',
  'requirements',
  'jobType',
  'experienceLevel',
  'location',
  'isRemote',
  'budgetMin',
  'budgetMax',
  'currency',
  'skillsRequired',
  'applicationDeadline',
  'startDate',
  'recruiterId',
] as const

const SAMPLE_ROW = [
  'Lead Actor for Feature Film',
  'Seeking an experienced lead actor for a Hindi feature film.',
  '5+ years screen experience; fluent Hindi and English',
  'CONTRACT',
  'SENIOR_LEVEL',
  'Mumbai',
  'false',
  '150000',
  '250000',
  'INR',
  // Comma-separated per the backend parser. Safe inside a CSV because every
  // cell is quoted — the commas stay within this one column.
  'Acting, Dialogue Delivery, Improvisation',
  '2026-09-30',
  '2026-10-15',
  '12',
]

/** Shown in the dialog so an admin knows what each column accepts. */
const COLUMN_HINTS: { column: string; required?: boolean; hint: string }[] = [
  { column: 'title', required: true, hint: 'Job title' },
  { column: 'description', required: true, hint: 'Job description' },
  { column: 'requirements', hint: 'Free text' },
  {
    column: 'jobType',
    hint: 'FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP, PROJECT_BASED',
  },
  {
    column: 'experienceLevel',
    hint: 'ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXPERT_LEVEL',
  },
  { column: 'location', hint: 'City name' },
  { column: 'isRemote', hint: 'true or false' },
  { column: 'budgetMin', hint: 'Number' },
  { column: 'budgetMax', hint: 'Number' },
  { column: 'currency', hint: 'Defaults to INR' },
  { column: 'skillsRequired', hint: 'Comma-separated' },
  { column: 'applicationDeadline', hint: 'YYYY-MM-DD' },
  { column: 'startDate', hint: 'YYYY-MM-DD' },
  { column: 'recruiterId', required: true, hint: 'Must already exist' },
]

const ACCEPTED_EXT = ['.xlsx', '.xls', '.csv']
const MAX_SIZE_MB = 10

/** Wrap a CSV cell so commas/quotes inside the value can't break the column layout. */
const csvCell = (value: string): string => `"${value.replace(/"/g, '""')}"`

interface Props {
  onClose: () => void
  /** Called after an upload that created at least one job, so the list can refresh. */
  onUploaded: () => void
}

export const BulkUploadJobsModal: React.FC<Props> = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<BulkUploadJobsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = useCallback((picked: File | null) => {
    setError(null)
    setResult(null)
    if (!picked) return

    const lower = picked.name.toLowerCase()
    if (!ACCEPTED_EXT.some((ext) => lower.endsWith(ext))) {
      setError(`Unsupported file type. Upload ${ACCEPTED_EXT.join(', ')}.`)
      return
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is larger than ${MAX_SIZE_MB} MB.`)
      return
    }
    setFile(picked)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    validateAndSet(e.dataTransfer.files?.[0] ?? null)
  }

  const downloadTemplate = () => {
    const csv = [
      TEMPLATE_COLUMNS.map(csvCell).join(','),
      SAMPLE_ROW.map(csvCell).join(','),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jobs-bulk-upload-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError(null)
    setResult(null)
    try {
      const res = await superAdminService.bulkUploadJobs(file, setProgress)
      setResult(res)
      if (res.successCount > 0) onUploaded()
    } catch (err: any) {
      const status = err?.response?.status
      const apiMsg = err?.response?.data?.message
      if (status === 401) setError('Unauthorized — please log in as an admin.')
      else if (status === 403) setError('Access denied — admin role required.')
      else if (status === 404)
        setError('Endpoint not found — backend route /super-admin/jobs/bulk-upload is missing.')
      else if (status === 413) setError('File too large for the server.')
      else setError(apiMsg || err?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>Bulk Upload Jobs</h2>
            <p className='text-xs text-gray-500 mt-0.5'>
              Upload an Excel or CSV sheet to create many jobs at once.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className='p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40'
            aria-label='Close'>
            <XIcon className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 space-y-4 overflow-y-auto'>
          {/* Template help */}
          <div className='flex items-start justify-between gap-4 bg-blue-50 border border-blue-100 rounded-lg p-3'>
            <div className='text-xs text-blue-900'>
              <p className='font-medium'>Not sure about the format?</p>
              <p className='mt-0.5 text-blue-800'>
                Download the template, fill one job per row, then upload it back.
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className='shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-100'>
              Download template
            </button>
          </div>

          {/* Column reference */}
          {!result && (
            <details className='border border-gray-200 rounded-lg'>
              <summary className='px-3 py-2 text-xs font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-50'>
                Column reference ({COLUMN_HINTS.length} columns)
              </summary>
              <div className='border-t border-gray-200 max-h-48 overflow-y-auto divide-y divide-gray-100'>
                {COLUMN_HINTS.map((c) => (
                  <div
                    key={c.column}
                    className='px-3 py-1.5 flex items-baseline gap-2 text-xs'>
                    <span className='font-mono text-gray-900 shrink-0'>{c.column}</span>
                    {c.required && (
                      <span className='text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-600 shrink-0'>
                        required
                      </span>
                    )}
                    <span className='text-gray-500 truncate'>{c.hint}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Dropzone */}
          {!result && (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#E36A3A] bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
              <input
                ref={inputRef}
                type='file'
                accept={ACCEPTED_EXT.join(',')}
                className='hidden'
                onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
              />
              <FileTextIcon className='h-8 w-8 mx-auto text-gray-400' />
              {file ? (
                <>
                  <p className='mt-2 text-sm font-medium text-gray-900'>{file.name}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    {(file.size / 1024).toFixed(1)} KB — click to choose a different file
                  </p>
                </>
              ) : (
                <>
                  <p className='mt-2 text-sm font-medium text-gray-700'>
                    Drop your sheet here, or click to browse
                  </p>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    {ACCEPTED_EXT.join(', ')} — up to {MAX_SIZE_MB} MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div>
              <div className='flex justify-between text-xs text-gray-600 mb-1'>
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-[#E36A3A] transition-all'
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <p className='text-xs text-gray-500 mt-1'>
                  Processing the sheet on the server — this can take a moment.
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className='flex gap-2 bg-red-50 border border-red-100 rounded-lg p-3'>
              <ExclamationCircleIcon className='h-4 w-4 text-red-600 shrink-0 mt-0.5' />
              <p className='text-xs text-red-700'>{error}</p>
            </div>
          )}

          {/* Result summary */}
          {result && (
            <div className='space-y-3'>
              <div className='grid grid-cols-3 gap-3'>
                <SummaryTile label='Total rows' value={result.totalRows} tone='neutral' />
                <SummaryTile label='Created' value={result.successCount} tone='success' />
                <SummaryTile label='Failed' value={result.failureCount} tone='danger' />
              </div>

              {result.successCount > 0 && (
                <div className='flex gap-2 bg-green-50 border border-green-100 rounded-lg p-3'>
                  <CheckCircleIcon className='h-4 w-4 text-green-600 shrink-0 mt-0.5' />
                  <p className='text-xs text-green-800'>
                    {result.successCount} job{result.successCount === 1 ? '' : 's'} added to the
                    jobs table. The list behind this dialog has been refreshed.
                  </p>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className='border border-gray-200 rounded-lg overflow-hidden'>
                  <p className='px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 border-b border-gray-200'>
                    Rows that were skipped
                  </p>
                  <div className='max-h-48 overflow-y-auto divide-y divide-gray-100'>
                    {result.errors.map((e, i) => (
                      <div key={i} className='px-3 py-2 text-xs'>
                        <span className='font-medium text-gray-900'>Row {e.row}</span>
                        {e.field && <span className='text-gray-500'> · {e.field}</span>}
                        <p className='text-red-600 mt-0.5'>{e.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 px-6 py-4 border-t border-gray-200'>
          {result ? (
            <>
              <button
                onClick={reset}
                className='px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'>
                Upload another
              </button>
              <button
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium rounded-lg bg-[#E36A3A] text-white hover:bg-[#d05c2e]'>
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={uploading}
                className='px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40'>
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className='px-4 py-2 text-sm font-medium rounded-lg bg-[#E36A3A] text-white hover:bg-[#d05c2e] disabled:opacity-40 disabled:cursor-not-allowed'>
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const SummaryTile: React.FC<{
  label: string
  value: number
  tone: 'neutral' | 'success' | 'danger'
}> = ({ label, value, tone }) => {
  const tones = {
    neutral: 'bg-gray-50 text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <div className={`border rounded-lg p-3 text-center ${tones[tone]}`}>
      <p className='text-xl font-semibold'>{value.toLocaleString()}</p>
      <p className='text-[11px] uppercase tracking-wide mt-0.5 opacity-80'>{label}</p>
    </div>
  )
}

export default BulkUploadJobsModal
