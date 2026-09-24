import React, { useEffect, useState } from 'react'
import { SearchIcon, XIcon } from '../../components/icons/IconComponents'

// Shared search box for the admin list pages. The parent keeps the applied
// term (which it sends to the API); this component keeps what is being typed
// and only submits on Enter or on clear, so every keystroke is not a request.
interface Props {
  value: string
  onSearch: (term: string) => void
  placeholder: string
  className?: string
}

export const AdminSearchBox: React.FC<Props> = ({ value, onSearch, placeholder, className = '' }) => {
  const [text, setText] = useState(value)

  // Keep in sync when the parent clears filters
  useEffect(() => setText(value), [value])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(text.trim())
  }

  return (
    <form onSubmit={submit} className={`relative flex-1 min-w-[220px] ${className}`}>
      <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
      <input
        type='text'
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        className='w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E36A3A]'
      />
      {(text || value) && (
        <button
          type='button'
          onClick={() => {
            setText('')
            onSearch('')
          }}
          title='Clear search'
          className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600'>
          <XIcon className='h-4 w-4' />
        </button>
      )}
    </form>
  )
}

export default AdminSearchBox
