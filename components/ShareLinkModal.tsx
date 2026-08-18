import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Icon from '@/components/Icon'

interface ShareLinkModalProps {
  open: boolean
  onClose: () => void
  link: string
  title?: string
  description?: string
}

// Reusable "share" popup: shows a public link in a read-only field with a
// one-click Copy button. Used for both artist profiles and job posts.
const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  open,
  onClose,
  link,
  title = 'Share',
  description = 'Anyone with this link can open it — no login needed.',
}) => {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center gap-2'>
            <Icon name='Share2' size={18} className='text-primary' />
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Close'
          >
            <Icon name='X' size={20} />
          </button>
        </div>

        <div className='px-6 py-5'>
          <p className='text-sm text-gray-500 mb-3'>{description}</p>

          <div className='flex items-center gap-2'>
            <input
              type='text'
              readOnly
              value={link}
              onFocus={e => e.target.select()}
              className='flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40'
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shrink-0 ${
                copied ? 'bg-green-600' : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              <Icon name={copied ? 'Check' : 'Copy'} size={16} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareLinkModal
