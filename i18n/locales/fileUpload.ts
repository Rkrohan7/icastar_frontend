import { defineMessages } from '../defineMessages'

// Shared by components/FileUpload/* and services/uploadService.ts
export default defineMessages({
  en: {
    uploaded: '✓ Uploaded',
    replace: 'Replace',
    image: {
      previewAlt: 'Preview',
      change: 'Change Image',
      upload: 'Upload Image',
      uploadSuccess: 'Image uploaded successfully!',
      uploadFailed: 'Failed to upload image. Please try again.',
      // Rendered as: before <strong>size</strong> after
      hintBefore: 'Photo size must be ',
      hintSize: '{{size}}MB or less',
      hintAfter: '. Supported formats: JPEG, PNG, WebP.',
    },
    video: {
      upload: 'Upload Video',
      uploading: 'Uploading video...',
      uploadSuccess: 'Video uploaded successfully!',
      uploadFailed: 'Failed to upload video. Please try again.',
      // Rendered as: before <strong>size</strong> after
      hintBefore: 'Video size must be ',
      hintSize: '{{size}}MB or less',
      hintAfter:
        '. Supported formats: MP4, MOV, AVI, WebM. Long videos can go over this limit — trim or compress them before uploading.',
    },
    document: {
      clickToUpload: 'Click to upload',
      orDragDrop: 'or drag and drop',
      formats: 'PDF, JPEG, PNG • Max {{size}}MB',
      uploadSuccess: 'Document uploaded successfully!',
      uploadFailed: 'Failed to upload document. Please try again.',
    },
    dropzone: {
      dropHere: 'Drop the files here...',
      // Rendered as: before <span>link</span> after
      before: 'Drag & drop files here, or ',
      link: 'click to select',
      after: '',
    },
    validation: {
      invalidImage: 'Please upload a valid image (JPEG, PNG, WebP) under {{max}}MB',
      invalidVideo: 'Please upload a valid video (MP4, MOV, AVI, WebM) under {{max}}MB',
      invalidDocument: 'Please upload a valid document (PDF, JPEG, PNG) under {{max}}MB',
      tooLarge: 'This file is {{size}}MB. Maximum allowed size is {{max}}MB — please choose a smaller file.',
    },
  },
  mr: {
    uploaded: '✓ अपलोड झाले',
    replace: 'बदला',
    image: {
      previewAlt: 'पूर्वावलोकन',
      change: 'इमेज बदला',
      upload: 'इमेज अपलोड करा',
      uploadSuccess: 'इमेज यशस्वीरित्या अपलोड झाली!',
      uploadFailed: 'इमेज अपलोड करता आली नाही. कृपया पुन्हा प्रयत्न करा.',
      hintBefore: 'फोटोचा आकार ',
      hintSize: '{{size}}MB किंवा त्यापेक्षा कमी',
      hintAfter: ' असावा. समर्थित फॉरमॅट: JPEG, PNG, WebP.',
    },
    video: {
      upload: 'व्हिडिओ अपलोड करा',
      uploading: 'व्हिडिओ अपलोड होत आहे...',
      uploadSuccess: 'व्हिडिओ यशस्वीरित्या अपलोड झाला!',
      uploadFailed: 'व्हिडिओ अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
      hintBefore: 'व्हिडिओचा आकार ',
      hintSize: '{{size}}MB किंवा त्यापेक्षा कमी',
      hintAfter:
        ' असावा. समर्थित फॉरमॅट: MP4, MOV, AVI, WebM. मोठे व्हिडिओ ही मर्यादा ओलांडू शकतात — अपलोड करण्यापूर्वी ते ट्रिम किंवा कॉम्प्रेस करा.',
    },
    document: {
      clickToUpload: 'अपलोड करण्यासाठी क्लिक करा',
      orDragDrop: 'किंवा ड्रॅग आणि ड्रॉप करा',
      formats: 'PDF, JPEG, PNG • कमाल {{size}}MB',
      uploadSuccess: 'दस्तऐवज यशस्वीरित्या अपलोड झाला!',
      uploadFailed: 'दस्तऐवज अपलोड करता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    },
    dropzone: {
      dropHere: 'फाइल्स येथे सोडा...',
      before: 'फाइल्स येथे ड्रॅग आणि ड्रॉप करा, किंवा ',
      link: 'निवडण्यासाठी क्लिक करा',
      after: '',
    },
    validation: {
      invalidImage: 'कृपया {{max}}MB पेक्षा कमी आकाराची वैध इमेज (JPEG, PNG, WebP) अपलोड करा',
      invalidVideo: 'कृपया {{max}}MB पेक्षा कमी आकाराचा वैध व्हिडिओ (MP4, MOV, AVI, WebM) अपलोड करा',
      invalidDocument: 'कृपया {{max}}MB पेक्षा कमी आकाराचा वैध दस्तऐवज (PDF, JPEG, PNG) अपलोड करा',
      tooLarge: 'ही फाइल {{size}}MB ची आहे. कमाल परवानगी असलेला आकार {{max}}MB आहे — कृपया लहान फाइल निवडा.',
    },
  },
})
