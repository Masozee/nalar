import api from '../api';

// URL Shortener
export const createShortURL = async (data: {
  original_url: string;
  title?: string;
  password?: string;
  expires_at?: string;
}) => {
  const response = await api.post('/tools/urls/', data);
  return response.data;
};

export const getShortURLs = async () => {
  const response = await api.get('/tools/urls/');
  return response.data;
};

export const getShortURLStats = async (id: string) => {
  const response = await api.get(`/tools/urls/${id}/stats/`);
  return response.data;
};

// QR Code
export const generateQRCode = async (data: {
  content: string;
  content_type?: string;
  size?: number;
  error_correction?: string;
  foreground_color?: string;
  background_color?: string;
}) => {
  const response = await api.post('/tools/qrcodes/generate/', data, {
    responseType: 'blob',
  });
  return response.data;
};

export const createQRCode = async (data: {
  content: string;
  title?: string;
  content_type?: string;
  size?: number;
}) => {
  const response = await api.post('/tools/qrcodes/', data);
  return response.data;
};

export const getQRCodes = async () => {
  const response = await api.get('/tools/qrcodes/');
  return response.data;
};

// Image Tools
export const compressImage = async (formData: FormData) => {
  const response = await api.post('/tools/images/compress/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });
  return response.data;
};

export const createCompressedImage = async (formData: FormData) => {
  const response = await api.post('/tools/images/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCompressedImages = async () => {
  const response = await api.get('/tools/images/');
  return response.data;
};

// PDF Tools
export const mergePDF = async (formData: FormData) => {
  const response = await api.post('/tools/pdf/merge/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const splitPDF = async (formData: FormData) => {
  const response = await api.post('/tools/pdf/split/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const auditPDF = async (formData: FormData) => {
  const response = await api.post('/tools/audit-pdf/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const convertDocxToPDF = async (formData: FormData) => {
  const response = await api.post('/tools/convert/docx-to-pdf/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });
  return response.data;
};

export const getPDFOperations = async () => {
  const response = await api.get('/tools/pdf/');
  return response.data;
};

// Downloaders
export const downloadYoutube = async (url: string, quality?: string) => {
  const response = await api.post('/tools/download/youtube/', { url, quality });
  return response.data;
};

export const downloadInstagram = async (url: string) => {
  const response = await api.post('/tools/download/instagram/', { url });
  return response.data;
};

export const downloadTwitter = async (url: string) => {
  const response = await api.post('/tools/download/twitter/', { url });
  return response.data;
};
