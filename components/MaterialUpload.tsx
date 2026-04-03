import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, File, Check, AlertCircle } from 'lucide-react';

/* ================================================================
   MaterialUpload — Multi-file upload with drag & drop
   Supports: PDF, DOC/DOCX, JPG, PNG, GIF, HEIC, HEIF, WebP, SVG
   ================================================================ */

export interface PendingFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  preview?: string;  // DataURL for images
  status: 'ready' | 'uploading' | 'done' | 'error';
}

interface MaterialUploadProps {
  onUpload: (files: PendingFile[], description: string) => void;
  onCancel: () => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/webp',
  'image/svg+xml',
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.heic,.heif,.webp,.svg';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fileIcon(type: string) {
  if (type.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
  if (type.includes('pdf')) return <FileText size={16} className="text-red-500" />;
  return <File size={16} className="text-gray-500" />;
}

const MaterialUpload: React.FC<MaterialUploadProps> = ({
  onUpload, onCancel, maxFiles = 10, maxSizeMB = 20,
}) => {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const pending: PendingFile[] = [];

    for (const f of arr) {
      if (files.length + pending.length >= maxFiles) break;
      if (f.size > maxSizeMB * 1048576) continue;

      const pf: PendingFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: f,
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        status: 'ready',
      };

      // Generate preview for images
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) => prev.map((p) =>
            p.id === pf.id ? { ...p, preview: e.target?.result as string } : p
          ));
        };
        reader.readAsDataURL(f);
      }

      pending.push(pf);
    }

    setFiles((prev) => [...prev, ...pending]);
  }, [files.length, maxFiles, maxSizeMB]);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleSubmit = () => {
    if (files.length === 0) return;
    onUpload(files, description);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[var(--color-mv-primary)] bg-[var(--color-mv-primary)]/5'
            : 'border-[var(--color-mv-border)] hover:border-[var(--color-mv-primary)] hover:bg-[var(--color-mv-hover)]'
        }`}
      >
        <Upload size={24} className="mx-auto text-[var(--color-mv-text-tertiary)] mb-2" />
        <p className="text-sm font-medium text-[var(--color-mv-text)]">
          {isDragging ? 'Dateien hier ablegen' : 'Dateien hochladen'}
        </p>
        <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">
          Klicke oder ziehe Dateien hierher · PDF, Bilder, Word · Max {maxSizeMB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--color-mv-bg)] group">
              {f.preview ? (
                <img src={f.preview} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[var(--color-mv-surface-secondary)] flex items-center justify-center shrink-0">
                  {fileIcon(f.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-mv-text)] truncate">{f.name}</p>
                <p className="text-[10px] text-[var(--color-mv-text-tertiary)]">{formatSize(f.size)}</p>
              </div>
              {f.status === 'done' && <Check size={14} className="text-green-500 shrink-0" />}
              {f.status === 'error' && <AlertCircle size={14} className="text-red-500 shrink-0" />}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                className="p-1 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung (z.B. Brüche Kapitel 3)..."
        className="mv-input w-full"
      />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">
          Abbrechen
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={files.length === 0}
          className="mv-btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload size={14} />
          {files.length > 0 ? `${files.length} ${files.length === 1 ? 'Datei' : 'Dateien'} hochladen` : 'Hochladen'}
        </button>
      </div>
    </div>
  );
};

export default MaterialUpload;
