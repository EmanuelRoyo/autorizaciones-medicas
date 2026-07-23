import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import SolicitudCard from '@/components/SolicitudCard';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AutorizadorDashboard() {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;

  const solicitudes = await prisma.solicitud.findMany({
    include: {
      autorizacion: true,
      medico: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
    autorizados: solicitudes.filter((s) => s.estado === 'AUTORIZADO').length,
    remision: solicitudes.filter((s) => s.estado === 'REMISION').length,
    rechazados: solicitudes.filter((s) => s.estado === 'RECHAZADO').length,
  };

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE');
  const procesadas = solicitudes.filter((s) => s.estado !== 'PENDIENTE');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel del Autorizador</h1>
          <p className="text-gray-500 mt-1">Bienvenido, {user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.autorizados}</p>
                <p className="text-xs text-gray-500">Autorizados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.remision}</p>
                <p className="text-xs text-gray-500">Remisión</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitudes Pendientes */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Solicitudes Pendientes
            {stats.pendientes > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.pendientes}
              </span>
            )}
          </h2>
          {pendientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-400 mb-3" />
                <p className="text-gray-600 font-medium">¡No hay solicitudes pendientes!</p>
                <p className="text-gray-500 text-sm">Todas las solicitudes han sido procesadas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendientes.map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id}
                  solicitud={{
                    ...solicitud,
                    createdAt: solicitud.createdAt.toISOString(),
                  }}
                  showMedico
                  linkPrefix="/autorizador/solicitudes"
                />
              ))}
            </div>
          )}
        </section>

        {/* Solicitudes Procesadas */}
        {procesadas.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Solicitudes Procesadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {procesadas.map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id}
                  solicitud={{
                    ...solicitud,
                    createdAt: solicitud.createdAt.toISOString(),
                  }}
                  showMedico
                  linkPrefix="/autorizador/solicitudes"
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
