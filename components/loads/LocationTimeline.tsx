import { formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { LoadEvent } from '@/types'
import { CheckCircle, AlertTriangle, MapPin, FileText, Truck, Clock } from 'lucide-react'

const EVENT_ICONS: Record<string, React.ReactNode> = {
  status_change:      <CheckCircle size={14} />,
  geofence_entered:   <MapPin size={14} />,
  geofence_exited:    <MapPin size={14} />,
  exception:          <AlertTriangle size={14} />,
  document_uploaded:  <FileText size={14} />,
  tracking_started:   <Truck size={14} />,
  tracking_stopped:   <Truck size={14} />,
  check_call:         <Clock size={14} />,
}

interface Props {
  events: LoadEvent[]
}

export default function LocationTimeline({ events }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1
        const colors = event.new_status
          ? STATUS_COLORS[event.new_status as keyof typeof STATUS_COLORS]
          : { dot: 'bg-slate-500', text: 'text-slate-300' }
        const Icon = EVENT_ICONS[event.event_type] ?? <Clock size={14} />

        return (
          <div key={event.id} style={{ display: 'flex', gap: 14 }}>
            {/* Timeline line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
                flexShrink: 0,
              }}>
                {Icon}
              </div>
              {!isLast && (
                <div style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--border-subtle)', margin: '4px 0' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {event.new_status
                    ? `Status → ${STATUS_LABELS[event.new_status as keyof typeof STATUS_LABELS] ?? event.new_status}`
                    : event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {formatDate(event.created_at, 'MMM d, h:mm a')}
                </span>
              </div>
              {event.notes && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{event.notes}</p>
              )}
              {event.actor && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  by {event.actor.full_name ?? 'System'}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {events.length === 0 && (
        <div className="empty-state" style={{ padding: 32 }}>
          <Clock size={28} />
          <p>No events recorded yet.</p>
        </div>
      )}
    </div>
  )
}
