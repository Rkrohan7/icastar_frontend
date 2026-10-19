import React from 'react'
import { ImageUpload } from '../FileUpload'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'

interface FormProps {
  formData: any
  updateFormData: (data: any) => void
  errors?: Record<string, string>
}

const ActorForm: React.FC<FormProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <div className='space-y-6'>
      <h3 className='text-xl font-bold border-b pb-2 text-gray-800'>
        Actor / Actress / Model Details
      </h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-600 mb-1.5'>
            Actor Type
          </label>
          <div className='flex gap-4 mt-1 p-1.5 bg-gray-50 rounded-lg border border-gray-200'>
            <label className='flex-1 text-center p-2 rounded-md cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-white transition-colors'>
              <input
                type='radio'
                name='actorType'
                value='skilled'
                className='sr-only'
                checked={(formData.actorType || 'skilled') === 'skilled'}
                onChange={() => updateFormData({ actorType: 'skilled' })}
              />
              <span className='text-sm font-medium'>Skilled Actor</span>
            </label>
            <label className='flex-1 text-center p-2 rounded-md cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-white transition-colors'>
              <input
                type='radio'
                name='actorType'
                value='known'
                className='sr-only'
                checked={formData.actorType === 'known'}
                onChange={() => updateFormData({ actorType: 'known' })}
              />
              <span className='text-sm font-medium'>Known Actor</span>
            </label>
          </div>
          {errors?.actorType && (
            <p className='text-red-500 text-sm mt-1'>{errors.actorType}</p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        <div>
          <input
            type='number'
            placeholder='Age'
            value={formData.age || ''}
            onChange={e => updateFormData({ age: e.target.value })}
            className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
          />
          {errors?.age && (
            <p className='text-red-500 text-sm mt-1'>{errors.age}</p>
          )}
        </div>

        <div>
          <input
            type='text'
            placeholder='Height (e.g., 5&apos;10")'
            value={formData.height || ''}
            onChange={e => updateFormData({ height: e.target.value })}
            className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
          />
          {errors?.height && (
            <p className='text-red-500 text-sm mt-1'>{errors.height}</p>
          )}
        </div>

        <div>
          <input
            type='text'
            placeholder='Weight (kg)'
            value={formData.weight || ''}
            onChange={e => updateFormData({ weight: e.target.value })}
            className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
          />
          {errors?.weight && (
            <p className='text-red-500 text-sm mt-1'>{errors.weight}</p>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <p className='text-sm font-semibold text-gray-700 mb-3'>Profile Photos</p>
          <p className='text-xs text-gray-500 mb-3'>Upload a clear front, left, and right profile image. Keep the face visible and avoid filters, caps, or headphones.</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <ImageUpload
            label='Front profile'
            uploadType='PROFILE_PHOTO'
            photoType='FRONT'
            aspectRatio='square'
            currentImageUrl={formData.frontProfilePhoto || ''}
            onUploadSuccess={fileUrl => updateFormData({ frontProfilePhoto: fileUrl })}
          />

          <ImageUpload
            label='Left side profile'
            uploadType='PROFILE_PHOTO'
            photoType='LEFT'
            aspectRatio='square'
            currentImageUrl={formData.leftProfilePhoto || ''}
            onUploadSuccess={fileUrl => updateFormData({ leftProfilePhoto: fileUrl })}
          />

          <ImageUpload
            label='Right side profile'
            uploadType='PROFILE_PHOTO'
            photoType='RIGHT'
            aspectRatio='square'
            currentImageUrl={formData.rightProfilePhoto || ''}
            onUploadSuccess={fileUrl => updateFormData({ rightProfilePhoto: fileUrl })}
          />
        </div>

        {errors?.profileImages && (
          <p className='text-red-500 text-sm mt-1'>{errors.profileImages}</p>
        )}
      </div>

      {/* Skilled Artist Additional Fields */}
      {(formData.actorType || 'skilled') === 'skilled' && (
        <div className='space-y-6 pt-4 border-t'>
          <h4 className='text-lg font-semibold text-gray-800'>Skilled Artist Details</h4>

          <div>
            <FileUpload
              label='ID-size Headshot'
              onFilesUploaded={files => updateFormData({ idSizePhoto: files[0] })}
              accept='image/*'
            />
            {errors?.idSizePhoto && (
              <p className='text-red-500 text-sm mt-1'>{errors.idSizePhoto}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <input
                type='text'
                placeholder='Hair Color'
                value={formData.hairColor || ''}
                onChange={e => updateFormData({ hairColor: e.target.value })}
                className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
              />
              {errors?.hairColor && (
                <p className='text-red-500 text-sm mt-1'>{errors.hairColor}</p>
              )}
            </div>
            <div>
              <select
                className='p-3 border border-gray-300 rounded-lg w-full bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition'
                value={formData.hairLength || ''}
                onChange={e => updateFormData({ hairLength: e.target.value })}
              >
                <option value=''>Hair Length</option>
                <option value='Short'>Short</option>
                <option value='Medium'>Medium</option>
                <option value='Long'>Long</option>
              </select>
              {errors?.hairLength && (
                <p className='text-red-500 text-sm mt-1'>{errors.hairLength}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={Boolean(formData.tattoo)}
                onCheckedChange={val => updateFormData({ tattoo: Boolean(val) })}
              />
              <span className='text-sm'>Tattoo</span>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={Boolean(formData.mole)}
                onCheckedChange={val => updateFormData({ mole: Boolean(val) })}
              />
              <span className='text-sm'>Mole</span>
            </div>
            <div>
              <input
                type='number'
                placeholder='Shoe Size'
                value={formData.shoeSize || ''}
                onChange={e => updateFormData({ shoeSize: e.target.value })}
                className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
              />
              {errors?.shoeSize && (
                <p className='text-red-500 text-sm mt-1'>{errors.shoeSize}</p>
              )}
            </div>
          </div>

          {/* Comfortable Areas Multi-select */}
          <div>
            {(() => {
              const options = [
                'Action',
                'Comedy',
                'Drama',
                'Romantic',
                'Negative Role',
                'Dance',
                'Modeling',
                'Voice-over',
              ]
              const selected: string[] = Array.isArray(formData.comfortableAreas)
                ? formData.comfortableAreas
                : []
              return (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    Comfortable Areas
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-between'>
                        {selected.length > 0 ? `${selected.length} selected` : 'Select areas'}
                        <span className='ml-2 text-gray-400'>▾</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-64 p-3 space-y-2'>
                      {options.map(opt => {
                        const checked = selected.includes(opt)
                        return (
                          <label key={opt} className='flex items-center gap-2'>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={val => {
                                const isChecked = Boolean(val)
                                const next = isChecked
                                  ? [...selected, opt]
                                  : selected.filter(s => s !== opt)
                                updateFormData({ comfortableAreas: next })
                              }}
                            />
                            <span className='text-sm'>{opt}</span>
                          </label>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                  {selected.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {selected.map(s => (
                        <Badge variant='secondary'>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Cities for Travel Multi-select */}
          <div>
            {(() => {
              const cities = [
                'Mumbai',
                'Delhi',
                'Bengaluru',
                'Hyderabad',
                'Chennai',
                'Kolkata',
                'Pune',
                'Ahmedabad',
                'Jaipur',
              ]
              const selected: string[] = Array.isArray(formData.travelCities)
                ? formData.travelCities
                : []
              return (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    Cities Where You Can Travel for Shoot
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-between'>
                        {selected.length > 0 ? `${selected.length} selected` : 'Select cities'}
                        <span className='ml-2 text-gray-400'>▾</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-72 p-3 space-y-2'>
                      {cities.map(city => {
                        const checked = selected.includes(city)
                        return (
                          <label key={city} className='flex items-center gap-2'>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={val => {
                                const isChecked = Boolean(val)
                                const next = isChecked
                                  ? [...selected, city]
                                  : selected.filter(c => c !== city)
                                updateFormData({ travelCities: next })
                              }}
                            />
                            <span className='text-sm'>{city}</span>
                          </label>
                        )
                      })}
                    </PopoverContent>
                  </Popover>
                  {selected.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {selected.map(city => (
                        <Badge key={city} variant='secondary'>
                          {city}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>

          {/* Navarasa Acting Video */}
          <div>
            <FileUpload
              label='9 Ras (Navarasa) Acting Video'
              onFilesUploaded={files => updateFormData({ navarasaVideo: files[0] })}
              accept='video/*'
            />
            {errors?.navarasaVideo && (
              <p className='text-red-500 text-sm mt-1'>{errors.navarasaVideo}</p>
            )}
          </div>

          {/* Projects List */}
          <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-700'>
              Name of Projects + Reference URLs
            </label>
            {(
              (Array.isArray(formData.projects) ? formData.projects : [{ name: '', url: '' }])
            ).map((proj: any, idx: number) => (
              <div key={idx} className='grid grid-cols-1 md:grid-cols-3 gap-3 items-start'>
                <input
                  type='text'
                  placeholder='Project Name'
                  value={proj.name || ''}
                  onChange={e => {
                    const next = (Array.isArray(formData.projects) ? [...formData.projects] : [{ name: '', url: '' }])
                    next[idx] = { ...next[idx], name: e.target.value }
                    updateFormData({ projects: next })
                  }}
                  className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition'
                />
                <input
                  type='url'
                  placeholder='Reference URL'
                  value={proj.url || ''}
                  onChange={e => {
                    const next = (Array.isArray(formData.projects) ? [...formData.projects] : [{ name: '', url: '' }])
                    next[idx] = { ...next[idx], url: e.target.value }
                    updateFormData({ projects: next })
                  }}
                  className='p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent transition md:col-span-2'
                />
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      const next = (Array.isArray(formData.projects) ? [...formData.projects] : [])
                      next.splice(idx, 1)
                      updateFormData({ projects: next.length ? next : [{ name: '', url: '' }] })
                    }}
                  >
                    Remove
                  </Button>
                  {idx === ((Array.isArray(formData.projects) ? formData.projects : [{ name: '', url: '' }]).length - 1) && (
                    <Button
                      type='button'
                      onClick={() => {
                        const next = (Array.isArray(formData.projects) ? [...formData.projects] : [{ name: '', url: '' }])
                        next.push({ name: '', url: '' })
                        updateFormData({ projects: next })
                      }}
                    >
                      Add Project
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audition Video (shown for all) */}
      <div>
        <FileUpload
          label='Audition Video'
          onFilesUploaded={files => updateFormData({ auditionVideo: files })}
        />
        {errors?.auditionVideo && (
          <p className='text-red-500 text-sm mt-1'>{errors.auditionVideo}</p>
        )}
      </div>
    </div>
  )
}

export default ActorForm
