// src/app/(auth)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar se o usuário já está autenticado
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Se já estiver autenticado, redirecionar para o dashboard
  if (user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}