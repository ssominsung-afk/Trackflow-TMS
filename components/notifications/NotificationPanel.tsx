'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Truck, AlertTriangle, MapPin, FileText } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'
import { createClient } from '@/lib/supabase/client'

const NOTIF_ICONS: Record<NotificationType, React.ReactNode> = {
  load_status:       <Truck size={14} />,
  tracking_accepted: <CheckCheck size={14} />,
  tracking_lost:     <AlertTriangle size={14} />,
  geofence_entered:  <MapPin size={14} />,
  geofence_exited:   <MapPin size={14} />,
  pod_uploaded:      <FileText size={14} />,
  late_risk:         <AlertTriangle size={14} />,
  exception:         <AlertTriangle size={14} />,
  system:            <Bell size={14} />,
}

interface Props {
  notifications: Notification[]
}

export default function NotificationPanel({ notifications }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.is_read).length
  const displayNotifs = notifications.slice(0, 5) // Show top 5

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAllRead() {
    if (unreadCount === 0) return
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="btn btn-ghost"
        style={{ position: 'relative', width: 36, height: 36, padding: 0, justifyContent: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent-red)',
            border: '2px solid var(--bg-surface)'
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 320, background: 'var(--bg-surface)',
          borderRadius: 8, border: '1px solid var(--border)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          zIndex: 100, overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: '4px 8px', height: 'auto' }}
                onClick={markAllRead}
              >
                Mark read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {displayNotifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No notifications
              </div>
            ) : (
              displayNotifs.map(n => (
                <div key={n.id} style={{
                  padding: 16, borderBottom: '1px solid var(--border-subtle)',
                  background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.05)',
                  display: 'flex', gap: 12
                }}>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                    {NOTIF_ICONS[n.type as NotificationType] ?? <Bell size={14} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    {n.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.message}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: 8, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link
              href="/notifications"
              className="btn btn-ghost"
              style={{ width: '100%', fontSize: 12, color: 'var(--accent-blue)' }}
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
