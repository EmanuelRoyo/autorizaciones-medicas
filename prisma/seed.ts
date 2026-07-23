import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpiar datos existentes
  await prisma.autorizacion.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.user.deleteMany();

  // Crear médico
  const medicoPassword = await bcrypt.hash('medico123', 10);
  const medico = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Pérez',
      email: 'medico@clinica.com',
      password: medicoPassword,
      role: 'MEDICO',
    },
  });

  // Crear autorizador
  const autorizadorPassword = await bcrypt.hash('auth123', 10);
  const autorizador = await prisma.user.create({
    data: {
      name: 'Ana Gómez',
      email: 'autorizador@clinica.com',
      password: autorizadorPassword,
      role: 'AUTORIZADOR',
    },
  });

  // Crear solicitudes de ejemplo
  await prisma.solicitud.create({
    data: {
      medicoId: medico.id,
      pacienteNombre: 'Juan Camilo Torres Ruiz',
      pacienteId: '1098765432',
      pacienteFechaNac: '1985-03-15',
      pacienteEdad: '39',
      pacienteSexo: 'M',
      pacienteDireccion: 'Calle 10 # 5-20',
      pacienteMunicipio: 'Montería',
      pacienteTelefono: '3001234567',
      contratante: 'COOSALUD EPS',
      noAtencion: 'AT-2024-001',
      tipoConsulta: 'Urgencias',
      medicoResponsable: 'Dr. Carlos Pérez',
      fechaIngreso: '2024-01-15 08:30',
      servicio: 'Urgencias',
      especialidad: 'Medicina General',
      causaExterna: 'Enfermedad general',
      descripcion: 'Paciente con dolor abdominal intenso, requiere hospitalización para estudios.',
      noHistoria: 'HC-001234',
      estado: 'PENDIENTE',
    },
  });

  await prisma.solicitud.create({
    data: {
      medicoId: medico.id,
      pacienteNombre: 'María Alejandra López',
      pacienteId: '1054321098',
      pacienteFechaNac: '1992-07-22',
      pacienteEdad: '32',
      pacienteSexo: 'F',
      pacienteDireccion: 'Carrera 15 # 8-45',
      pacienteMunicipio: 'Montería',
      pacienteTelefono: '3109876543',
      contratante: 'SURA EPS',
      noAtencion: 'AT-2024-002',
      tipoConsulta: 'Consulta Externa',
      medicoResponsable: 'Dr. Carlos Pérez',
      fechaIngreso: '2024-01-16 10:00',
      servicio: 'Consulta Externa',
      especialidad: 'Ortopedia',
      causaExterna: 'Accidente de trabajo',
      descripcion: 'Fractura de tobillo derecho, requiere manejo especializado.',
      noHistoria: 'HC-001235',
      estado: 'PENDIENTE',
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('👤 Usuarios creados:');
  console.log(`   - Médico: ${medico.email} / medico123`);
  console.log(`   - Autorizador: ${autorizador.email} / auth123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
