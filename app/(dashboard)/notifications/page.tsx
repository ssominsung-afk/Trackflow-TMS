import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bell, CheckCheck, AlertTriangle, Package, MapPin, FileText, Truck } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/utils'
import type { NotificationType } from '@/types'

const NOTIF_ICONS: Record<NotificationType, React.ReactNode> = {
  load_status:       <Package size={15} />,
  tracking_accepted: <Truck size={15} />,
  tracking_lost:     <AlertTriangle size={15} />,
  geofence_entered:  <MapPin size={15} />,
  geofence_exited:   <MapPin size={15} />,
  pod_uploaded:      <FileText size={15} />,
  late_risk:         <AlertTriangle size={15} />,
  exception:         <AlertTriangle size={15} />,
  system:            <Bell size={15} />,
}

const NOTIF_COLORS: Record<NotificationType, string> = {
  load_status:       '#3b82f6',
  tracking_accepted: '#10b981',
  tracking_lost:     '#f59e0b',
  geofence_entered:  '#6366f1',
  geofence_exited:   '#6366f1',
  pod_uploaded:      '#10b981',
  late_risk:         '#f59e0b',
  exception:         '#ef4444',
  system:            '#8899aa',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, load:loads(load_number)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const safeNotifications = notifications || []

  const unread = safeNotifications.filter(n => !n.is_read).length

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <form action={async () => {
            'use server'
            const s = await (await import('@/lib/supabase/server')).createClient()
            const { data: aData } = await s.auth.getUser()
            const u = aData?.user
            if (u) {
              await s.from('notifications').update({ is_read: true }).eq('user_id', u.id).eq('is_read', false)
            }
          }}>
            <button type="submit" className="btn btn-secondary btn-sm">
              <CheckCheck size={13} /> Mark all read
            </button>
          </form>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {safeNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={32} />
            <p>No notifications yet</p>
          </div>
        ) : (
          safeNotifications.map(notif => {
            const icon = NOTIF_ICONS[notif.type as NotificationType] ?? <Bell size={15} />
            const color = NOTIF_COLORS[notif.type as NotificationType] ?? '#8899aa'
            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: notif.is_read ? 'transparent' : 'rgba(59,130,246,0.04)',
                  transition: 'background 0.1s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `${color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color,
                }}>
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: notif.is_read ? 400 : 600, marginBottom: 2 }}>
                        {notif.title}
                      </div>
                      {notif.message && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{notif.message}</div>
                      )}
                      {(notif as any).load && (
                        <Link
                          href={`/loads/${notif.load_id}`}
                          style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4, display: 'block' }}
                        >
                          View {(notif as any).load.load_number} →
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {timeAgo(notif.created_at)}
                      </span>
                      {!notif.is_read && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
