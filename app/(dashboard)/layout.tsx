import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <TopBar />
        <main style={{
          flex: 1,
          padding: '24px',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
