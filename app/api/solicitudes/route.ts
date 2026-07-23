import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/solicitudes - Listar solicitudes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as any;

    let solicitudes;

    if (user.role === 'MEDICO') {
      // Médico solo ve sus solicitudes
      solicitudes = await prisma.solicitud.findMany({
        where: { medicoId: user.id },
        include: {
          autorizacion: true,
          medico: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'AUTORIZADOR') {
      // Autorizador ve todas las solicitudes
      solicitudes = await prisma.solicitud.findMany({
        include: {
          autorizacion: true,
          medico: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 403 });
    }

    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/solicitudes - Crear nueva solicitud
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = session.user as any;

    if (user.role !== 'MEDICO') {
      return NextResponse.json({ error: 'Solo los médicos pueden crear solicitudes' }, { status: 403 });
    }

    const body = await request.json();

    const solicitud = await prisma.solicitud.create({
      data: {
        medicoId: user.id,
        pacienteNombre: body.pacienteNombre || '',
        pacienteId: body.pacienteId || '',
        pacienteFechaNac: body.pacienteFechaNac,
        pacienteEdad: body.pacienteEdad,
        pacienteSexo: body.pacienteSexo,
        pacienteDireccion: body.pacienteDireccion,
        pacienteMunicipio: body.pacienteMunicipio,
        pacienteTelefono: body.pacienteTelefono,
        contratante: body.contratante,
        noAtencion: body.noAtencion,
        tipoConsulta: body.tipoConsulta,
        medicoResponsable: body.medicoResponsable,
        fechaIngreso: body.fechaIngreso,
        servicio: body.servicio,
        especialidad: body.especialidad,
        causaExterna: body.causaExterna,
        descripcion: body.descripcion,
        noHistoria: body.noHistoria,
        pdfOriginalPath: body.pdfOriginalPath,
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json(solicitud, { status: 201 });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
