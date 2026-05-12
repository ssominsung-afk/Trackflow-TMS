import { createClient } from '@/lib/supabase/server'
import {
  Package, Truck, AlertTriangle, TrendingUp,
  CheckCircle, FileX, BarChart3, Zap
} from 'lucide-react'
import Link from 'next/link'
import LoadStatusBadge from '@/components/loads/LoadStatusBadge'
import { formatDate, RISK_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
  let loads: any[] = []
  let error: any = null
  
  try {
    const supabase = await createClient()
    const { data, error: dbError } = await supabase
      .from('loads')
      .select('*, carrier:carriers(name), customer:customers(name), driver:drivers(full_name)')
      .order('created_at', { ascending: false })
      .limit(50)
    
    loads = data || []
    error = dbError
  } catch (e: any) {
    error = e
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
        <h3 className="font-bold mb-2 text-lg">System Status: Interrupted</h3>
        <p className="text-sm opacity-80">{error.message || 'The dashboard experienced a temporary connection issue. Please try refreshing.'}</p>
      </div>
    )
  }

  // Safe stats calculation
  const safeLoads = loads || []
  
  const activeCount = safeLoads.filter(l => 
    l?.status && ['dispatched','at_pickup','loaded','in_transit','at_delivery'].includes(l.status)
  ).length
  
  const deliveredToday = safeLoads.filter(l => 
    l?.status === 'delivered' && l.delivery_actual && 
    new Date(l.delivery_actual).toDateString() === new Date().toDateString()
  ).length

  const riskCount = safeLoads.filter(l => l?.risk_level === 'late' || l?.risk_level === 'at_risk').length
  const missingPOD = safeLoads.filter(l => l?.status === 'delivered' && !l?.pod_url).length

  const STATS = [
    { label: 'Active Loads', value: activeCount, icon: Package, color: '#3b82f6' },
    { label: 'Delivered Today', value: deliveredToday, icon: CheckCircle, color: '#10b981' },
    { label: 'At Risk', value: riskCount, icon: AlertTriangle, color: '#ef4444' },
    { label: 'POD Missing', value: missingPOD, icon: FileX, color: '#f59e0b' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Operations Overview</h2>
        <p className="text-zinc-400 text-sm">Real-time monitoring across your entire fleet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(stat => (
          <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <span className="text-sm text-zinc-400 font-medium">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exception Feed */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-bottom border-zinc-800 flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <h3 className="font-semibold text-sm">Exception Feed</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {safeLoads.filter(l => ['late', 'exception'].includes(l.status)).length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm">No active exceptions</div>
            ) : (
              safeLoads.filter(l => ['late', 'exception'].includes(l.status)).slice(0, 5).map(load => (
                <Link key={load.id} href={`/loads/${load.id}`} className="block p-4 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm text-white mb-1">{load.load_number}</div>
                      <div className="text-xs text-zinc-500">{load.pickup_city} → {load.delivery_city}</div>
                    </div>
                    <LoadStatusBadge status={load.status} size="sm" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-4 border-bottom border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-400" />
              <h3 className="font-semibold text-sm">Recent Loads</h3>
            </div>
            <Link href="/loads" className="text-xs text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {safeLoads.slice(0, 5).map(load => (
              <Link key={load.id} href={`/loads/${load.id}`} className="block p-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-white mb-1">{load.load_number}</div>
                    <div className="text-xs text-zinc-500">
                      {load.customer?.name || 'No Customer'} • {load.carrier?.name || 'No Carrier'}
                    </div>
                  </div>
                  <LoadStatusBadge status={load.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
