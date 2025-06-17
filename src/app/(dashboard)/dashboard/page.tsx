import { createClient } from '@/lib/supabase/server'
import DashboardView from '@/components/dashboard/DashboardView'
import { redirect } from 'next/navigation'

async function getCompanyId() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) redirect('/setup')
  
  return userData.company_id
}

export default async function DashboardPage() {
  const companyId = await getCompanyId()
  
  return <DashboardView companyId={companyId} />
}