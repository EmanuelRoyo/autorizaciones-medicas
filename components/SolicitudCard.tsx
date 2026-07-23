import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, FileText, Eye } from 'lucide-react';
import Link from 'next/link';

interface Solicitud {
  id: string;
  pacienteNombre: string;
  pacienteId: string;
  contratante?: string | null;
  tipoConsulta?: string | null;
  especialidad?: string | null;
  estado: string;
  createdAt: string;
  medico?: { name: string };
  pdfSelloPath?: string | null;
}

interface SolicitudCardProps {
  solicitud: Solicitud;
  showMedico?: boolean;
  linkPrefix?: string;
}

const estadoBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  AUTORIZADO: { label: 'Autorizado', variant: 'success' },
  REMISION: { label: 'Remisión', variant: 'info' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
};

export default function SolicitudCard({
  solicitud,
  showMedico = false,
  linkPrefix = '/autorizador/solicitudes',
}: SolicitudCardProps) {
  const badge = estadoBadge[solicitud.estado] || { label: solicitud.estado, variant: 'default' as const };
  const createdDate = new Date(solicitud.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
            {solicitud.pacienteNombre}
          </CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <p className="text-sm text-gray-500">CC: {solicitud.pacienteId}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {solicitud.contratante && (
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{solicitud.contratante}</span>
            </div>
          )}
          {solicitud.tipoConsulta && (
            <div className="flex items-center gap-1 text-gray-600">
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{solicitud.tipoConsulta}</span>
            </div>
          )}
          {solicitud.especialidad && (
            <div className="flex items-center gap-1 text-gray-600">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{solicitud.especialidad}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{createdDate}</span>
          </div>
        </div>

        {showMedico && solicitud.medico && (
          <p className="text-xs text-gray-500 mt-1">
            Médico: {solicitud.medico.name}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`${linkPrefix}/${solicitud.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Ver Detalles
            </Button>
          </Link>
          {solicitud.pdfSelloPath && (
            <a
              href={solicitud.pdfSelloPath}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Button variant="secondary" size="sm">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                PDF
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
