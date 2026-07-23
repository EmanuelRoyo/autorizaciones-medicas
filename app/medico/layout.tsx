import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const user = session.user as any;
  if (user.role !== 'MEDICO') {
    redirect('/autorizador/dashboard');
  }

  return <>{children}</>;
}
