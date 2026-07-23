import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/solicitudes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: params.id },
      include: {
        autorizacion: {
          include: {
            autorizador: { select: { name: true, email: true } },
          },
        },
        medico: { select: { name: true, email: true } },
      },
    });

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PATCH /api/solicitudes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const solicitud = await prisma.solicitud.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
