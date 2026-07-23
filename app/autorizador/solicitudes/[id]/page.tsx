import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SelloAutorizacion from '@/components/SelloAutorizacion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, FileText, User, MapPin, Phone, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  AUTORIZADO: { label: 'Autorizado', variant: 'success' },
  REMISION: { label: 'Remisión', variant: 'info' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
};

export default async function AutorizadorSolicitudDetalle({
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
      medico: { select: { name: true } },
    },
  });

  if (!solicitud) {
    notFound();
  }

  const badge = estadoBadge[solicitud.estado] || { label: solicitud.estado, variant: 'default' as const };
  const isPendiente = solicitud.estado === 'PENDIENTE';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/autorizador/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al Panel
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{solicitud.pacienteNombre}</h1>
              <p className="text-gray-500">CC: {solicitud.pacienteId} — Médico: {solicitud.medico.name}</p>
            </div>
            <Badge variant={badge.variant} className="text-sm px-3 py-1">{badge.label}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Información de la solicitud */}
          <div className="lg:col-span-3 space-y-4">
            {/* Datos del Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-blue-600" />
                  Datos del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {solicitud.noHistoria && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">N° Historia Clínica:</span>
                    <span className="ml-2">{solicitud.noHistoria}</span>
                  </div>
                )}
                {solicitud.pacienteFechaNac && (
                  <div>
                    <span className="font-medium text-gray-600">Fecha Nac.:</span>
                    <span className="ml-2">{solicitud.pacienteFechaNac}</span>
                  </div>
                )}
                {solicitud.pacienteEdad && (
                  <div>
                    <span className="font-medium text-gray-600">Edad:</span>
                    <span className="ml-2">{solicitud.pacienteEdad}</span>
                  </div>
                )}
                {solicitud.pacienteSexo && (
                  <div>
                    <span className="font-medium text-gray-600">Sexo:</span>
                    <span className="ml-2">{solicitud.pacienteSexo}</span>
                  </div>
                )}
                {solicitud.contratante && (
                  <div>
                    <span className="font-medium text-gray-600">EPS:</span>
                    <span className="ml-2">{solicitud.contratante}</span>
                  </div>
                )}
                {solicitud.pacienteDireccion && (
                  <div className="col-span-2 flex gap-1">
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
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                {solicitud.noAtencion && (
                  <div>
                    <span className="font-medium text-gray-600">N° Atención:</span>
                    <span className="ml-2">{solicitud.noAtencion}</span>
                  </div>
                )}
                {solicitud.tipoConsulta && (
                  <div>
                    <span className="font-medium text-gray-600">Tipo:</span>
                    <span className="ml-2">{solicitud.tipoConsulta}</span>
                  </div>
                )}
                {solicitud.especialidad && (
                  <div>
                    <span className="font-medium text-gray-600">Especialidad:</span>
                    <span className="ml-2">{solicitud.especialidad}</span>
                  </div>
                )}
                {solicitud.medicoResponsable && (
                  <div>
                    <span className="font-medium text-gray-600">Médico:</span>
                    <span className="ml-2">{solicitud.medicoResponsable}</span>
                  </div>
                )}
                {solicitud.servicio && (
                  <div>
                    <span className="font-medium text-gray-600">Servicio:</span>
                    <span className="ml-2">{solicitud.servicio}</span>
                  </div>
                )}
                {solicitud.fechaIngreso && (
                  <div className="flex gap-1 col-span-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{solicitud.fechaIngreso}</span>
                  </div>
                )}
                {solicitud.causaExterna && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">Causa Externa:</span>
                    <span className="ml-2">{solicitud.causaExterna}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Descripción */}
            {solicitud.descripcion && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Descripción / Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{solicitud.descripcion}</p>
                </CardContent>
              </Card>
            )}

            {/* PDFs */}
            <div className="flex gap-3 flex-wrap">
              {solicitud.pdfOriginalPath && (
                <a href={solicitud.pdfOriginalPath} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver PDF Original
                  </Button>
                </a>
              )}
              {solicitud.pdfSelloPath && (
                <a href={solicitud.pdfSelloPath} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="default" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Descargar PDF con Sello
                  </Button>
                </a>
              )}
            </div>

            {/* Autorización ya registrada */}
            {solicitud.autorizacion && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Autorización Registrada
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
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

          {/* Formulario de Autorización */}
          <div className="lg:col-span-2">
            {isPendiente ? (
              <SelloAutorizacion
                solicitudId={solicitud.id}
                autorizadorNombre={user.name}
              />
            ) : (
              <Card className="border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                  <p className="text-gray-700 font-medium">Solicitud ya procesada</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Estado: {badge.label}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
