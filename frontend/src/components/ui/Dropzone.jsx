import React, { useState } from 'react';
import { IconUpload, IconFileText } from '@icons/icons';

export const Dropzone = ({
  onFileSelect,
  label = 'Drag & drop media files or brief here',
  sublabel = 'Supports MP4, MOV, PDF, PNG, JPG (up to 100MB)',
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: '100%',
        padding: '32px 24px',
        border: `2px dashed ${isDragOver ? 'var(--accent-gold)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isDragOver ? 'rgba(201, 160, 107, 0.06)' : 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
      className={`custom-dropzone ${className}`}
    >
      <input
        type="file"
        onChange={handleFileChange}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
        }}
      />
      {selectedFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconFileText size={28} color="var(--accent-gold)" />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <IconUpload size={22} color="var(--accent-gold)" />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
            {label}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{sublabel}</p>
        </>
      )}
    </div>
  );
};
