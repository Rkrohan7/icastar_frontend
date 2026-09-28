import { defineMessages } from '../defineMessages'

// Column names, enum values, file extensions and date formats shown next to
// these strings must match the backend parser, so they stay in the component.
export default defineMessages({
  en: {
    title: 'Bulk Upload Jobs',
    subtitle: 'Upload an Excel or CSV sheet to create many jobs at once.',
    template: {
      question: 'Not sure about the format?',
      help: 'Download the template, fill one job per row, then upload it back.',
      download: 'Download template',
    },
    columns: {
      summary: 'Column reference ({{count}} columns)',
      required: 'required',
      hints: {
        jobTitle: 'Job title',
        jobDescription: 'Job description',
        freeText: 'Free text',
        cityName: 'City name',
        trueOrFalse: 'true or false',
        number: 'Number',
        currencyDefault: 'Defaults to INR',
        commaSeparated: 'Comma-separated',
        mustExist: 'Must already exist',
      },
    },
    dropzone: {
      selected: '{{size}} KB — click to choose a different file',
      prompt: 'Drop your sheet here, or click to browse',
      limits: '{{types}} — up to {{size}} MB',
    },
    uploading: 'Uploading…',
    processing: 'Processing the sheet on the server — this can take a moment.',
    errors: {
      unsupportedType: 'Unsupported file type. Upload {{types}}.',
      tooLarge: 'File is larger than {{size}} MB.',
      unauthorized: 'Unauthorized — please log in as an admin.',
      forbidden: 'Access denied — admin role required.',
      notFound: 'Endpoint not found — backend route {{route}} is missing.',
      serverTooLarge: 'File too large for the server.',
      uploadFailed: 'Upload failed. Please try again.',
    },
    result: {
      totalRows: 'Total rows',
      created: 'Created',
      failed: 'Failed',
      jobsAdded_one:
        '{{count}} job added to the jobs table. The list behind this dialog has been refreshed.',
      jobsAdded_other:
        '{{count}} jobs added to the jobs table. The list behind this dialog has been refreshed.',
      skippedRows: 'Rows that were skipped',
      row: 'Row {{row}}',
    },
    uploadAnother: 'Upload another',
  },
  mr: {
    title: 'नोकऱ्या बल्क अपलोड करा',
    subtitle: 'एकाच वेळी अनेक नोकऱ्या तयार करण्यासाठी Excel किंवा CSV शीट अपलोड करा.',
    template: {
      question: 'फॉरमॅटबद्दल खात्री नाही?',
      help: 'टेम्पलेट डाउनलोड करा, प्रत्येक ओळीत एक नोकरी भरा आणि नंतर ती परत अपलोड करा.',
      download: 'टेम्पलेट डाउनलोड करा',
    },
    columns: {
      summary: 'कॉलम संदर्भ ({{count}} कॉलम)',
      required: 'आवश्यक',
      hints: {
        jobTitle: 'नोकरीचे शीर्षक',
        jobDescription: 'नोकरीचे वर्णन',
        freeText: 'मुक्त मजकूर',
        cityName: 'शहराचे नाव',
        trueOrFalse: 'true किंवा false',
        number: 'संख्या',
        currencyDefault: 'डीफॉल्ट INR',
        commaSeparated: 'स्वल्पविरामाने वेगळे केलेले',
        mustExist: 'आधीपासून अस्तित्वात असणे आवश्यक',
      },
    },
    dropzone: {
      selected: '{{size}} KB — दुसरी फाइल निवडण्यासाठी क्लिक करा',
      prompt: 'तुमची शीट येथे ड्रॉप करा किंवा ब्राउझ करण्यासाठी क्लिक करा',
      limits: '{{types}} — जास्तीत जास्त {{size}} MB',
    },
    uploading: 'अपलोड होत आहे…',
    processing: 'सर्व्हरवर शीटवर प्रक्रिया होत आहे — याला थोडा वेळ लागू शकतो.',
    errors: {
      unsupportedType: 'या प्रकारची फाइल समर्थित नाही. {{types}} फाइल अपलोड करा.',
      tooLarge: 'फाइल {{size}} MB पेक्षा मोठी आहे.',
      unauthorized: 'अनधिकृत — कृपया ॲडमिन म्हणून लॉग इन करा.',
      forbidden: 'प्रवेश नाकारला — ॲडमिन भूमिका आवश्यक आहे.',
      notFound: 'एंडपॉइंट सापडला नाही — बॅकएंड रूट {{route}} उपलब्ध नाही.',
      serverTooLarge: 'सर्व्हरसाठी फाइल खूप मोठी आहे.',
      uploadFailed: 'अपलोड अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.',
    },
    result: {
      totalRows: 'एकूण ओळी',
      created: 'तयार झाल्या',
      failed: 'अयशस्वी',
      jobsAdded_one:
        '{{count}} नोकरी नोकऱ्यांच्या टेबलमध्ये जोडली गेली. या डायलॉगमागील यादी रिफ्रेश केली आहे.',
      jobsAdded_other:
        '{{count}} नोकऱ्या नोकऱ्यांच्या टेबलमध्ये जोडल्या गेल्या. या डायलॉगमागील यादी रिफ्रेश केली आहे.',
      skippedRows: 'वगळलेल्या ओळी',
      row: 'ओळ {{row}}',
    },
    uploadAnother: 'आणखी एक अपलोड करा',
  },
})
