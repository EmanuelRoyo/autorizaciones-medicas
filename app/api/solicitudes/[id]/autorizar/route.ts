import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generarPDFConSello } from '@/lib/generarSello';

// POST /api/solicitudes/[id]/autorizar
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== 'AUTORIZADOR') {
      return NextResponse.json(
        { error: 'Solo los autorizadores pueden autorizar solicitudes' },
        { status: 403 }
      );
    }

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: params.id },
    });

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'La solicitud ya fue procesada' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      hospitalizar,
      ponerEnRemision,
      cancelaCopago,
      entrega,
      recibidoFecha,
    } = body;

    const autorizaFecha = new Date();
    const recibidoDate = recibidoFecha ? new Date(recibidoFecha) : new Date();

    // Determinar nuevo estado
    const nuevoEstado = ponerEnRemision ? 'REMISION' : 'AUTORIZADO';

    // Generar PDF con sello si hay un PDF original
    let pdfSelloPath: string | null = null;

    if (solicitud.pdfOriginalPath) {
      try {
        const outputFileName = `sello_${params.id}_${Date.now()}.pdf`;
        pdfSelloPath = await generarPDFConSello(
          solicitud.pdfOriginalPath,
          {
            hospitalizar: hospitalizar || false,
            ponerEnRemision: ponerEnRemision || false,
            cancelaCopago: cancelaCopago || false,
            autoriza: user.name || user.email,
            autorizaFecha,
            recibidoFecha: recibidoDate,
            entrega: entrega || '',
          },
          outputFileName
        );
      } catch (pdfError) {
        console.error('Error al generar PDF con sello:', pdfError);
        // Continuar sin PDF si hay error
      }
    }

    // Crear la autorización
    const autorizacion = await prisma.autorizacion.create({
      data: {
        solicitudId: params.id,
        autorizadorId: user.id,
        hospitalizar: hospitalizar || false,
        ponerEnRemision: ponerEnRemision || false,
        cancelaCopago: cancelaCopago || false,
        autoriza: user.name || user.email,
        autorizaFecha,
        recibidoFecha: recibidoDate,
        entrega: entrega || '',
      },
    });

    // Actualizar estado de la solicitud
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id: params.id },
      data: {
        estado: nuevoEstado,
        pdfSelloPath: pdfSelloPath,
      },
      include: {
        autorizacion: true,
      },
    });

    return NextResponse.json(solicitudActualizada, { status: 201 });
  } catch (error) {
    console.error('Error al autorizar solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
