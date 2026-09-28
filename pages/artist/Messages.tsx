import React, { useState } from 'react'
import Icon from '@/components/Icon'
import { useTranslation } from '@/i18n'

const recruiters = [
  {
    id: 1,
    name: 'Rohan Kapoor',
    company: 'Harmony Studios',
    avatar: 'https://picsum.photos/seed/rec1/48/48',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Priya Singh',
    company: 'SoundWave Productions',
    avatar: 'https://picsum.photos/seed/rec2/48/48',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Amit Desai',
    company: 'Creative Canvas',
    avatar: 'https://picsum.photos/seed/rec3/48/48',
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: 'Sneha Verma',
    company: 'Vogue India',
    avatar: 'https://picsum.photos/seed/rec4/48/48',
    unread: 5,
    online: true,
  },
]

const messages = {
  1: [
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat1.msg1',
    },
    {
      from: 'artist',
      textKey: 'artistMessages.sample.chat1.msg2',
    },
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat1.msg3',
    },
  ],
  4: [
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat4.msg1',
    },
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat4.msg2',
    },
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat4.msg3',
    },
    {
      from: 'artist',
      textKey: 'artistMessages.sample.chat4.msg4',
    },
    {
      from: 'recruiter',
      textKey: 'artistMessages.sample.chat4.msg5',
    },
  ],
}

const Messages: React.FC = () => {
  const [activeChat, setActiveChat] = useState(4)
  const { t } = useTranslation()
  const activeRecruiter = recruiters.find(r => r.id === activeChat)

  return (
    <div className='h-[calc(100vh-128px)] flex bg-white rounded-2xl shadow-lg overflow-hidden'>
      {/* Left Pane: Recruiter List */}
      <div className='w-1/3 border-r border-gray-200 flex flex-col'>
        <div className='p-4 border-b border-gray-200'>
          <h2 className='text-xl font-bold'>{t('common.nav.messages')}</h2>
        </div>
        <ul className='overflow-y-auto'>
          {recruiters.map(rec => (
            <li key={rec.id}>
              <button
                onClick={() => setActiveChat(rec.id)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-colors ${
                  activeChat === rec.id ? 'bg-amber-50' : 'hover:bg-gray-50'
                }`}>
                <div className='relative'>
                  <img
                    src={rec.avatar}
                    alt={rec.name}
                    className='w-12 h-12 rounded-full'
                  />
                  {rec.online && (
                    <span className='absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white'></span>
                  )}
                </div>
                <div className='flex-grow'>
                  <p className='font-semibold'>{rec.name}</p>
                  <p className='text-sm text-gray-500'>{rec.company}</p>
                </div>
                {rec.unread > 0 && (
                  <span className='bg-amber-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full'>
                    {rec.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Pane: Chat Window */}
      <div className='w-2/3 flex flex-col'>
        {activeRecruiter ? (
          <>
            <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
              <div>
                <h3 className='font-bold text-lg'>{activeRecruiter.name}</h3>
                <p className='text-sm text-gray-500'>
                  {activeRecruiter.company}
                </p>
              </div>
              <div className='flex items-center gap-4'>
                <button className='text-gray-500 hover:text-amber-600'>
                  <Icon name='Phone' size={20} />
                </button>
                <button className='text-gray-500 hover:text-amber-600'>
                  <Icon name='Video' size={20} />
                </button>
                <button className='text-gray-500 hover:text-amber-600'>
                  <Icon name='MoreVertical' size={20} />
                </button>
              </div>
            </div>

            <div className='flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50'>
              {(messages[activeChat as keyof typeof messages] || []).map(
                (msg, i) => (
                  <div
                    key={i}
                    className={`flex items-end gap-2 ${
                      msg.from === 'artist' ? 'justify-end' : 'justify-start'
                    }`}>
                    {msg.from === 'recruiter' && (
                      <img
                        src={activeRecruiter.avatar}
                        className='w-8 h-8 rounded-full'
                      />
                    )}
                    <div
                      className={`max-w-md p-3 rounded-2xl ${
                        msg.from === 'artist'
                          ? 'bg-amber-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                      }`}>
                      <p>{t(msg.textKey)}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className='p-4 border-t border-gray-200 bg-white'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder={t('artistMessages.inputPlaceholder')}
                  className='w-full h-12 bg-gray-100 rounded-xl pl-12 pr-20 focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
                <button className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600'>
                  <Icon name='Smile' size={22} />
                </button>
                <button className='absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white p-2 rounded-lg hover:from-amber-700 hover:to-amber-600 transition-colors'>
                  <Icon name='Send' size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-center text-gray-500'>
            <div>
              <Icon
                name='MessageSquare'
                size={64}
                className='mx-auto text-gray-300'
              />
              <p className='mt-2'>{t('artistMessages.selectConversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
