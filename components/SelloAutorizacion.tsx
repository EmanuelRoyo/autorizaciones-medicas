'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface SelloAutorizacionProps {
  solicitudId: string;
  autorizadorNombre: string;
}

export default function SelloAutorizacion({
  solicitudId,
  autorizadorNombre,
}: SelloAutorizacionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    hospitalizar: false,
    ponerEnRemision: false,
    cancelaCopago: false,
    entrega: '',
    recibidoFecha: new Date().toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/solicitudes/${solicitudId}/autorizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al autorizar');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/autorizador/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la autorización');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-3" />
          <h3 className="text-xl font-semibold text-green-800 mb-1">
            ¡Autorización Registrada!
          </h3>
          <p className="text-green-600">
            El PDF con el sello ha sido generado. Redirigiendo...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 rounded-t-lg">
        <CardTitle className="text-blue-900 text-xl">
          🏥 Formulario de Autorización
        </CardTitle>
        <p className="text-sm text-blue-700">
          Complete el sello de autorización médica
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Acciones */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Acción</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                <Checkbox
                  id="hospitalizar"
                  checked={form.hospitalizar}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, hospitalizar: checked === true })
                  }
                />
                <label
                  htmlFor="hospitalizar"
                  className="font-medium cursor-pointer select-none"
                >
                  HOSPITALIZAR
                </label>
              </div>
              <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50">
                <Checkbox
                  id="poner-en-remision"
                  checked={form.ponerEnRemision}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, ponerEnRemision: checked === true })
                  }
                />
                <label
                  htmlFor="poner-en-remision"
                  className="font-medium cursor-pointer select-none"
                >
                  PONER EN REMISIÓN
                </label>
              </div>
            </div>
          </div>

          {/* Cancela Copago */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Cancela Copago</Label>
            <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 w-fit">
              <Checkbox
                id="cancela-copago"
                checked={form.cancelaCopago}
                onCheckedChange={(checked) =>
                  setForm({ ...form, cancelaCopago: checked === true })
                }
              />
              <label
                htmlFor="cancela-copago"
                className="font-medium cursor-pointer select-none"
              >
                {form.cancelaCopago ? 'SÍ cancela copago' : 'NO cancela copago'}
              </label>
            </div>
          </div>

          {/* Autoriza */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Autoriza</Label>
            <div className="bg-gray-50 border rounded-lg p-3 space-y-1">
              <p className="font-medium text-gray-900">{autorizadorNombre}</p>
              <p className="text-sm text-gray-500">
                Fecha/Hora: {new Date().toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          {/* Recibido */}
          <div className="space-y-2">
            <Label htmlFor="recibidoFecha" className="text-base font-semibold">
              Recibido - Fecha y Hora
            </Label>
            <Input
              id="recibidoFecha"
              type="datetime-local"
              value={form.recibidoFecha}
              onChange={(e) => setForm({ ...form, recibidoFecha: e.target.value })}
              required
            />
          </div>

          {/* Entrega */}
          <div className="space-y-2">
            <Label htmlFor="entrega" className="text-base font-semibold">
              Entrega - Nombre de quien entrega
            </Label>
            <Input
              id="entrega"
              type="text"
              placeholder="Nombre completo de quien entrega"
              value={form.entrega}
              onChange={(e) => setForm({ ...form, entrega: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              'Guardar Autorización y Generar Sello'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
