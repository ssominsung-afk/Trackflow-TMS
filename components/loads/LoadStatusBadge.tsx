import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { LoadStatus } from '@/types'

interface Props {
  status: LoadStatus
  size?: 'sm' | 'md'
  pulse?: boolean
}

export default function LoadStatusBadge({ status, size = 'md', pulse = false }: Props) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.available
  const label = STATUS_LABELS[status] || 'Unknown'

  return (
    <span
      className="badge"
      style={{
        background: colors.bg.replace('bg-', ''),
        color: colors.text.replace('text-', ''),
        fontSize: size === 'sm' ? 10 : 11,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
      }}
    >
      <span
        className={`badge-dot ${pulse && (status === 'in_transit' || status === 'at_pickup' || status === 'at_delivery') ? 'animate-pulse-dot' : ''}`}
        style={{ background: colors.dot.replace('bg-', '') }}
      />
      {label}
    </span>
  )
}
