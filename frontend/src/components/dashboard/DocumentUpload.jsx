import React, { useState, useEffect } from 'react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function DocumentUpload({ onParsed }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const { uploadDocument, status, progress, parsedFields } = useDocumentUpload();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return;
    }

    setSelectedFile(file);
    setError('');
    uploadDocument(file);
  };

  useEffect(() => {
    if (parsedFields) {
      onParsed(parsedFields);
    }
  }, [parsedFields]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload Your Filing Documents</h2>
      <input type="file" onChange={handleFileChange} style={styles.input} />
      {error && <p style={styles.error}>{error}</p>}
      {selectedFile && (
        <div style={styles.statusBox}>
          <p>Uploading: {selectedFile.name}</p>
          <p>Status: {status}</p>
          <p>Progress: {progress}%</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1rem',
    background: '#1a001f',
    borderRadius: '8px',
    boxShadow: '0 0 12px rgba(161, 102, 255, 0.3)',
    color: '#fff',
    marginTop: '2rem',
  },
  heading: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '6px',
    background: '#2a0033',
    color: '#fff',
    border: 'none',
    boxShadow: '0 0 8px #a166ff',
  },
  error: {
    color: '#ff6666',
    marginTop: '0.5rem',
  },
  statusBox: {
    marginTop: '1rem',
    background: '#2a0033',
    padding: '0.75rem',
    borderRadius: '6px',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.1)',
  },
};