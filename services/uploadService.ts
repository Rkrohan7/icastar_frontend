import apiClient, { uploadFile as apiUploadFile } from './apiClient'

export type UploadType = 'PROFILE_PHOTO' | 'COVER_PHOTO' | 'ID_PROOF' | 'AUDITION_VIDEO' | 'AUDITION_THUMBNAIL' | 'PORTFOLIO_IMAGE' | 'PORTFOLIO_VIDEO' | 'FACE_VERIFICATION' | 'DANCE_SHOWREEL' | 'BLOG_IMAGE'

export interface PresignedUrlRequest {
  fileName: string
  fileType: string
  uploadType: UploadType
  auditionId?: number // Required for audition uploads
}

export interface PresignedUrlResponse {
  presignedUrl: string
  fileUrl: string
  uploadId: string
  expiresIn: number
}

export interface UploadProgressCallback {
  (progress: number): void
}

export const uploadService = {
  /**
   * Step 1: Get pre-signed URL from backend
   */
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await apiClient.post('/upload/presigned-url', request)
    return response.data.data || response.data
  },

  /**
   * Step 2: Upload file directly to S3 using pre-signed URL
   */
  async uploadToS3(
    presignedUrl: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100
          onProgress(Math.round(percentComplete))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 204) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  },

  /**
   * Step 3: Confirm upload completion to backend
   */
  async confirmUpload(uploadId: string, fileUrl: string): Promise<void> {
    await apiClient.post('/upload/confirm', {
      uploadId,
      fileUrl,
    })
  },

  /**
   * Complete upload flow: Get URL → Upload to S3 → Confirm
   */
  async uploadFile(
    file: File,
    uploadType: UploadType,
    onProgress?: UploadProgressCallback,
    auditionId?: number
  ): Promise<string> {
    try {
      // Step 1: Get pre-signed URL
      const presignedData = await this.getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        uploadType,
        auditionId,
      })

      // Step 2: Upload to S3
      await this.uploadToS3(presignedData.presignedUrl, file, onProgress)

      // Step 3: Confirm upload (optional, depending on backend)
      // await this.confirmUpload(presignedData.uploadId, presignedData.fileUrl)

      // Return the final file URL
      return presignedData.fileUrl
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  },

  /**
   * Upload artist profile photo directly to backend
   */
  async uploadArtistProfilePhoto(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const response = await apiUploadFile('/upload/artist-profile-photo', file, onProgress)
    const data = response.data.data || response.data
    return data.profileUrl
  },

  /**
   * Upload cover photo directly to backend
   */
  async uploadCoverPhoto(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const response = await apiUploadFile('/upload/cover-photo', file, onProgress)
    const data = response.data.data || response.data
    return data.coverPhotoUrl
  },

  /**
   * Upload ID proof directly to backend
   */
  async uploadIdProof(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const response = await apiUploadFile('/upload/id-proof', file, onProgress)
    const data = response.data.data || response.data
    return data.idProofUrl
  },

  /**
   * Upload dance showreel directly to backend
   */
  async uploadDanceShowreel(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    const response = await apiUploadFile('/upload/dance-showreel', file, onProgress)
    const data = response.data.data || response.data
    return data.videoUrl
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File, type: 'image' | 'video' | 'document'): { valid: boolean; error?: string } {
    const validations = {
      image: {
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        error: 'Please upload a valid image (JPEG, PNG, WebP) under 5MB',
      },
      video: {
        types: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
        maxSize: 100 * 1024 * 1024, // 100MB
        error: 'Please upload a valid video (MP4, MOV, AVI, WebM) under 100MB',
      },
      document: {
        types: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        error: 'Please upload a valid document (PDF, JPEG, PNG) under 10MB',
      },
    }

    const config = validations[type]

    if (!config.types.includes(file.type)) {
      return { valid: false, error: config.error }
    }

    if (file.size > config.maxSize) {
      return { valid: false, error: config.error }
    }

    return { valid: true }
  },
}

export default uploadService
