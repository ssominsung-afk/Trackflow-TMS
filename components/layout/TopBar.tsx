'use client'

import { Bell, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/loads':        'Loads',
  '/map':          'Live Map',
  '/notifications':'Notifications',
  '/carriers':     'Carriers',
  '/settings':     'Settings',
}

export default function TopBar() {
  const pathname = usePathname()

  const title = Object.entries(PAGE_TITLES).find(([k]) =>
    pathname === k || pathname.startsWith(k + '/')
  )?.[1] ?? 'TrackFlow'

  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Page title */}
      <h1 style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--text-primary)',
        flex: 1,
      }}>
        {title}
      </h1>

      {/* Search */}
      <div style={{ position: 'relative', width: 220 }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          className="input"
          placeholder="Search loads..."
          style={{ paddingLeft: 30, height: 34, fontSize: 13 }}
        />
      </div>

      {/* New Load */}
      <Link href="/loads/new" className="btn btn-primary btn-sm">
        <Plus size={14} />
        New Load
      </Link>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="btn btn-ghost btn-icon"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--accent-red)',
          border: '1px solid var(--bg-surface)',
        }} />
      </Link>
    </header>
  )
}
