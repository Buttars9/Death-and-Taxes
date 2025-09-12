import { useState } from 'react';

export function useDocumentUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [parsedFields, setParsedFields] = useState<Record<string, string> | null>(null);

  const uploadDocument = async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setParsedFields(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setParsedFields(result.data || {});
      setProgress(100);
      setStatus('success');
    } catch (err) {
      console.error('Document upload error:', err);
      setStatus('error');
    }
  };

  return { uploadDocument, status, progress, parsedFields };
}