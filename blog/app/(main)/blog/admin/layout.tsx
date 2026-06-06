import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AdminLayoutClient from './AdminLayoutClient';
import { isValidSession } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('chatwiz_admin_session')?.value;
  
  const isValid = isValidSession(session);
  console.log(`[Blog Admin] Session token: ${session ? 'present' : 'missing'}, Valid: ${isValid}`);

  if (!isValid) {
    redirect('/blog/auth/login');
  }

  return (
    <Suspense fallback={null}>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </Suspense>
  );
}
