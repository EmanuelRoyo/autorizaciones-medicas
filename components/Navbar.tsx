'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAutorizador = user?.role === 'AUTORIZADOR';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAutorizador ? '/autorizador/dashboard' : '/medico/dashboard'} className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Autorizaciones Médicas</p>
              <p className="text-xs text-gray-500">Clínica Regional del San Jorge</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-2">
            <Link href={isAutorizador ? '/autorizador/dashboard' : '/medico/dashboard'}>
              <Button variant="ghost" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-1.5" />
                Dashboard
              </Button>
            </Link>
            {!isAutorizador && (
              <Link href="/medico/nueva-solicitud">
                <Button variant="ghost" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Nueva Solicitud
                </Button>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {isAutorizador ? '✅ Autorizador' : '🩺 Médico'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
