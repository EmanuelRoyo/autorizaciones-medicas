'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface ExtractedData {
  noHistoria?: string;
  pacienteNombre?: string;
  pacienteId?: string;
  pacienteFechaNac?: string;
  pacienteEdad?: string;
  pacienteSexo?: string;
  pacienteDireccion?: string;
  pacienteMunicipio?: string;
  pacienteTelefono?: string;
  contratante?: string;
  noAtencion?: string;
  tipoConsulta?: string;
  medicoResponsable?: string;
  fechaIngreso?: string;
  servicio?: string;
  especialidad?: string;
  causaExterna?: string;
  descripcion?: string;
}

interface PDFUploaderProps {
  onDataExtracted: (data: ExtractedData, pdfPath: string) => void;
}

export default function PDFUploader({ onDataExtracted }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Solo se aceptan archivos PDF');
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Solo se aceptan archivos PDF');
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el PDF');
      }

      onDataExtracted(data.extractedData, data.pdfPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">
            Arrastra el PDF aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Solo archivos PDF (máx. 10 MB)
          </p>
          <label htmlFor="pdf-upload">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('pdf-upload')?.click()}
            >
              Seleccionar PDF
            </Button>
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Extraer Datos del PDF
            </>
          )}
        </Button>
      )}
    </div>
  );
}
