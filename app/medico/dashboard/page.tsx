import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import SolicitudCard from '@/components/SolicitudCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { PlusCircle, ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MedicoDashboard() {
  const session = await getServerSession(authOptions);
  const user = session!.user as any;

  const solicitudes = await prisma.solicitud.findMany({
    where: { medicoId: user.id },
    include: { autorizacion: true },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
    autorizados: solicitudes.filter((s) => s.estado === 'AUTORIZADO').length,
    remision: solicitudes.filter((s) => s.estado === 'REMISION').length,
    rechazados: solicitudes.filter((s) => s.estado === 'RECHAZADO').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Solicitudes
            </h1>
            <p className="text-gray-500 mt-1">
              Bienvenido, {user.name}
            </p>
          </div>
          <Link href="/medico/nueva-solicitud">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </Link>
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
                <p className="text-2xl font-bold text-gray-900">{stats.autorizados + stats.remision}</p>
                <p className="text-xs text-gray-500">Autorizados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rechazados}</p>
                <p className="text-xs text-gray-500">Rechazados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de solicitudes */}
        {solicitudes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No tienes solicitudes aún
              </h3>
              <p className="text-gray-500 mb-6">
                Crea tu primera solicitud subiendo un PDF de orden médica
              </p>
              <Link href="/medico/nueva-solicitud">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Primera Solicitud
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solicitudes.map((solicitud) => (
              <SolicitudCard
                key={solicitud.id}
                solicitud={{
                  ...solicitud,
                  createdAt: solicitud.createdAt.toISOString(),
                }}
                linkPrefix="/medico/solicitudes"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
