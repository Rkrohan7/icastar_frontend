import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Icon from '../Icon'
import { useTranslation } from '@/i18n'

interface FileUploadProps {
  label: string
  note?: string
  multiple?: boolean
  onFilesUploaded: (files: File[]) => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  note,
  multiple = false,
  onFilesUploaded,
}) => {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles
      setFiles(newFiles)
      onFilesUploaded(newFiles)
    },
    [files, multiple, onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple,
      onDragEnter: undefined,
      onDragOver: undefined,
      onDragLeave: undefined
  })

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => file !== fileToRemove)
    setFiles(newFiles)
    onFilesUploaded(newFiles)
  }

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-primary'
        }`}>
        <input {...getInputProps()} />
        <Icon
          name='UploadCloud'
          size={32}
          className='mx-auto text-gray-400 mb-2'
        />
        {isDragActive ? (
          <p className='text-primary font-semibold'>
            {t('fileUpload.dropzone.dropHere')}
          </p>
        ) : (
          <p className='text-gray-500 text-sm'>
            {t('fileUpload.dropzone.before')}
            <span className='text-primary font-semibold'>
              {t('fileUpload.dropzone.link')}
            </span>
            {t('fileUpload.dropzone.after')}
          </p>
        )}
      </div>
      {note && <p className='text-xs text-gray-500 mt-1'>{note}</p>}

      {files.length > 0 && (
        <div className='mt-4 space-y-2'>
          <ul className='space-y-1'>
            {files.map((file, index) => (
              <li
                key={index}
                className='text-sm flex items-center justify-between bg-gray-100 p-2 rounded-md'>
                <span className='truncate pr-2'>{file.name}</span>
                <button
                  onClick={() => removeFile(file)}
                  className='text-red-500 hover:text-red-700 flex-shrink-0'>
                  <Icon name='XCircle' size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUpload
