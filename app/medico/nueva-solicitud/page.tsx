'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PDFUploader from '@/components/PDFUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  noHistoria: string;
  pacienteNombre: string;
  pacienteId: string;
  pacienteFechaNac: string;
  pacienteEdad: string;
  pacienteSexo: string;
  pacienteDireccion: string;
  pacienteMunicipio: string;
  pacienteTelefono: string;
  contratante: string;
  noAtencion: string;
  tipoConsulta: string;
  medicoResponsable: string;
  fechaIngreso: string;
  servicio: string;
  especialidad: string;
  causaExterna: string;
  descripcion: string;
  pdfOriginalPath: string;
}

const EMPTY_FORM: FormData = {
  noHistoria: '',
  pacienteNombre: '',
  pacienteId: '',
  pacienteFechaNac: '',
  pacienteEdad: '',
  pacienteSexo: '',
  pacienteDireccion: '',
  pacienteMunicipio: '',
  pacienteTelefono: '',
  contratante: '',
  noAtencion: '',
  tipoConsulta: '',
  medicoResponsable: '',
  fechaIngreso: '',
  servicio: '',
  especialidad: '',
  causaExterna: '',
  descripcion: '',
  pdfOriginalPath: '',
};

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfExtracted, setPdfExtracted] = useState(false);

  const handlePDFExtracted = (extractedData: Partial<FormData>, pdfPath: string) => {
    setFormData({
      ...EMPTY_FORM,
      ...Object.fromEntries(
        Object.entries(extractedData).map(([key, value]) => [key, value || ''])
      ),
      pdfOriginalPath: pdfPath,
    });
    setPdfExtracted(true);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la solicitud');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/medico/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                ¡Solicitud Creada!
              </h3>
              <p className="text-green-700">
                La solicitud ha sido registrada y está pendiente de autorización.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/medico/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Autorización</h1>
          <p className="text-gray-500 mt-1">
            Sube el PDF de la orden médica para extraer los datos automáticamente
          </p>
        </div>

        <div className="space-y-6">
          {/* PDF Uploader */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Subir PDF de Orden Médica</CardTitle>
              <CardDescription>
                El sistema extraerá los datos automáticamente del PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUploader onDataExtracted={handlePDFExtracted} />
              {pdfExtracted && (
                <p className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  ✅ Datos extraídos correctamente. Revisa y completa la información a continuación.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Datos del Paciente</CardTitle>
              <CardDescription>
                Revisa y completa los datos extraídos del PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos del Paciente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="noHistoria">N° Historia Clínica</Label>
                    <Input
                      id="noHistoria"
                      value={formData.noHistoria}
                      onChange={(e) => handleChange('noHistoria', e.target.value)}
                      placeholder="HC-000000"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="pacienteNombre">Nombre del Paciente *</Label>
                    <Input
                      id="pacienteNombre"
                      value={formData.pacienteNombre}
                      onChange={(e) => handleChange('pacienteNombre', e.target.value)}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteId">Identificación (CC) *</Label>
                    <Input
                      id="pacienteId"
                      value={formData.pacienteId}
                      onChange={(e) => handleChange('pacienteId', e.target.value)}
                      placeholder="Número de cédula"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteFechaNac">Fecha de Nacimiento</Label>
                    <Input
                      id="pacienteFechaNac"
                      value={formData.pacienteFechaNac}
                      onChange={(e) => handleChange('pacienteFechaNac', e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteEdad">Edad</Label>
                    <Input
                      id="pacienteEdad"
                      value={formData.pacienteEdad}
                      onChange={(e) => handleChange('pacienteEdad', e.target.value)}
                      placeholder="Edad en años"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteSexo">Sexo</Label>
                    <Input
                      id="pacienteSexo"
                      value={formData.pacienteSexo}
                      onChange={(e) => handleChange('pacienteSexo', e.target.value)}
                      placeholder="M / F"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="pacienteDireccion">Dirección</Label>
                    <Input
                      id="pacienteDireccion"
                      value={formData.pacienteDireccion}
                      onChange={(e) => handleChange('pacienteDireccion', e.target.value)}
                      placeholder="Dirección del paciente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteMunicipio">Municipio</Label>
                    <Input
                      id="pacienteMunicipio"
                      value={formData.pacienteMunicipio}
                      onChange={(e) => handleChange('pacienteMunicipio', e.target.value)}
                      placeholder="Municipio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pacienteTelefono">Teléfono</Label>
                    <Input
                      id="pacienteTelefono"
                      value={formData.pacienteTelefono}
                      onChange={(e) => handleChange('pacienteTelefono', e.target.value)}
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>

                {/* Datos de la Consulta */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Datos de la Consulta</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contratante">Contratante (EPS)</Label>
                      <Input
                        id="contratante"
                        value={formData.contratante}
                        onChange={(e) => handleChange('contratante', e.target.value)}
                        placeholder="Nombre de la EPS"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="noAtencion">N° Atención</Label>
                      <Input
                        id="noAtencion"
                        value={formData.noAtencion}
                        onChange={(e) => handleChange('noAtencion', e.target.value)}
                        placeholder="Número de atención"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoConsulta">Tipo de Consulta</Label>
                      <Input
                        id="tipoConsulta"
                        value={formData.tipoConsulta}
                        onChange={(e) => handleChange('tipoConsulta', e.target.value)}
                        placeholder="Urgencias / Consulta Externa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicoResponsable">Médico Responsable</Label>
                      <Input
                        id="medicoResponsable"
                        value={formData.medicoResponsable}
                        onChange={(e) => handleChange('medicoResponsable', e.target.value)}
                        placeholder="Nombre del médico"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaIngreso">Fecha y Hora de Ingreso</Label>
                      <Input
                        id="fechaIngreso"
                        value={formData.fechaIngreso}
                        onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                        placeholder="YYYY-MM-DD HH:MM"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servicio">Servicio</Label>
                      <Input
                        id="servicio"
                        value={formData.servicio}
                        onChange={(e) => handleChange('servicio', e.target.value)}
                        placeholder="Urgencias / Hospitalización"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="especialidad">Especialidad</Label>
                      <Input
                        id="especialidad"
                        value={formData.especialidad}
                        onChange={(e) => handleChange('especialidad', e.target.value)}
                        placeholder="Especialidad médica"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="causaExterna">Causa Externa</Label>
                      <Input
                        id="causaExterna"
                        value={formData.causaExterna}
                        onChange={(e) => handleChange('causaExterna', e.target.value)}
                        placeholder="Causa externa"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="descripcion">Descripción / Plan</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      placeholder="Descripción del caso y plan de manejo"
                      rows={4}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Link href="/medico/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Crear Solicitud'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
