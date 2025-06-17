import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  PlugZap, 
  Settings, 
  LogOut,
  BarChart3,
  Users,
  TrendingUp
} from 'lucide-react'

async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Integrações', href: '/integrations', icon: PlugZap },
    { name: 'Campanhas', href: '/campaigns', icon: TrendingUp },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold text-white">Marketing Dashboard</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
              <button
                className="ml-3 rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}