import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FileText, Calendar, User, MapPin, Phone, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  AUTORIZADO: { label: 'Autorizado', variant: 'success' },
  REMISION: { label: 'Remisión', variant: 'info' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
};

export default async function MedicoSolicitudDetalle({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;

  const solicitud = await prisma.solicitud.findUnique({
    where: { id: params.id },
    include: {
      autorizacion: {
        include: { autorizador: { select: { name: true } } },
      },
    },
  });

  if (!solicitud || solicitud.medicoId !== user.id) {
    notFound();
  }

  const badge = estadoBadge[solicitud.estado] || { label: solicitud.estado, variant: 'default' as const };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/medico/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{solicitud.pacienteNombre}</h1>
              <p className="text-gray-500">CC: {solicitud.pacienteId}</p>
            </div>
            <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos del Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-blue-600" />
                Datos del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {solicitud.noHistoria && (
                <div><span className="font-medium text-gray-600">N° Historia:</span> {solicitud.noHistoria}</div>
              )}
              {solicitud.pacienteFechaNac && (
                <div><span className="font-medium text-gray-600">Fecha Nac.:</span> {solicitud.pacienteFechaNac}</div>
              )}
              {solicitud.pacienteEdad && (
                <div><span className="font-medium text-gray-600">Edad:</span> {solicitud.pacienteEdad}</div>
              )}
              {solicitud.pacienteSexo && (
                <div><span className="font-medium text-gray-600">Sexo:</span> {solicitud.pacienteSexo}</div>
              )}
              {solicitud.pacienteDireccion && (
                <div className="flex gap-1">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{solicitud.pacienteDireccion}, {solicitud.pacienteMunicipio}</span>
                </div>
              )}
              {solicitud.pacienteTelefono && (
                <div className="flex gap-1">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{solicitud.pacienteTelefono}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos de la Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-blue-600" />
                Datos de la Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {solicitud.contratante && (
                <div><span className="font-medium text-gray-600">EPS:</span> {solicitud.contratante}</div>
              )}
              {solicitud.noAtencion && (
                <div><span className="font-medium text-gray-600">N° Atención:</span> {solicitud.noAtencion}</div>
              )}
              {solicitud.tipoConsulta && (
                <div><span className="font-medium text-gray-600">Tipo:</span> {solicitud.tipoConsulta}</div>
              )}
              {solicitud.especialidad && (
                <div><span className="font-medium text-gray-600">Especialidad:</span> {solicitud.especialidad}</div>
              )}
              {solicitud.medicoResponsable && (
                <div><span className="font-medium text-gray-600">Médico:</span> {solicitud.medicoResponsable}</div>
              )}
              {solicitud.fechaIngreso && (
                <div className="flex gap-1">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>{solicitud.fechaIngreso}</span>
                </div>
              )}
              {solicitud.causaExterna && (
                <div><span className="font-medium text-gray-600">Causa:</span> {solicitud.causaExterna}</div>
              )}
            </CardContent>
          </Card>

          {/* Descripción */}
          {solicitud.descripcion && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Descripción / Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{solicitud.descripcion}</p>
              </CardContent>
            </Card>
          )}

          {/* Autorización */}
          {solicitud.autorizacion && (
            <Card className="lg:col-span-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  Autorización
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Hospitalizar:</span>
                  <span className="ml-1">{solicitud.autorizacion.hospitalizar ? '✅ Sí' : '❌ No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Remisión:</span>
                  <span className="ml-1">{solicitud.autorizacion.ponerEnRemision ? '✅ Sí' : '❌ No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cancela Copago:</span>
                  <span className="ml-1">{solicitud.autorizacion.cancelaCopago ? '✅ Sí' : '❌ No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Autoriza:</span>
                  <span className="ml-1">{solicitud.autorizacion.autoriza}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Entrega:</span>
                  <span className="ml-1">{solicitud.autorizacion.entrega}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Autorizador:</span>
                  <span className="ml-1">{solicitud.autorizacion.autorizador.name}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* PDFs */}
        <div className="mt-6 flex gap-3 flex-wrap">
          {solicitud.pdfOriginalPath && (
            <a href={solicitud.pdfOriginalPath} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Descargar PDF Original
              </Button>
            </a>
          )}
          {solicitud.pdfSelloPath && (
            <a href={solicitud.pdfSelloPath} target="_blank" rel="noopener noreferrer" download>
              <Button variant="default">
                <FileText className="mr-2 h-4 w-4" />
                Descargar PDF con Sello
              </Button>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
