import { createClient } from '@/lib/supabase/server'
import { 
  User, 
  Building2, 
  Bell, 
  Globe, 
  Shield, 
  Save,
  Mail,
  Smartphone,
  Lock,
  Eye,
  Languages
} from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>System Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Manage your account preferences and organization configuration
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        
        {/* Profile Settings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: 'var(--accent-blue-glow)', 
              display: 'flex', alignItems: 'center', justifyItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="var(--accent-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Profile Information</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Update your personal details</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" defaultValue={user?.user_metadata?.full_name || 'Administrator'} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" defaultValue={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed directly.</p>
            </div>
            <div>
              <label className="label">Role</label>
              <input type="text" className="input" defaultValue="Dispatch Manager" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>
        </div>

        {/* Company Settings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: 'rgba(16, 185, 129, 0.1)', 
              display: 'flex', alignItems: 'center', justifyItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} color="var(--accent-emerald)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Organization</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Company-wide configuration</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Company Name</label>
              <input type="text" className="input" defaultValue="TrackFlow Logistics" placeholder="Company name" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">DOT Number</label>
                <input type="text" className="input" defaultValue="1234567" placeholder="DOT #" />
              </div>
              <div>
                <label className="label">MC Number</label>
                <input type="text" className="input" defaultValue="987654" placeholder="MC #" />
              </div>
            </div>
            <div>
              <label className="label">Timezone</label>
              <select className="input" defaultValue="America/New_York">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: 'rgba(245, 158, 11, 0.1)', 
              display: 'flex', alignItems: 'center', justifyItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={20} color="var(--accent-amber)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Notifications</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>How you receive updates</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Email Notifications</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Receive daily load summaries</div>
                </div>
              </div>
              <div style={{ width: 36, height: 20, background: 'var(--accent-blue)', borderRadius: 20, position: 'relative' }}>
                <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }} />
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Smartphone size={16} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Browser Push</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Critical load status alerts</div>
                </div>
              </div>
              <div style={{ width: 36, height: 20, background: 'var(--border)', borderRadius: 20, position: 'relative' }}>
                <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', left: 3, top: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* System & Localization */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: 'rgba(139, 92, 246, 0.1)', 
              display: 'flex', alignItems: 'center', justifyItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={20} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Localization</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Interface & Measurement</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Language</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}>
                  <Languages size={14} /> English
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>한국어</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Español</button>
              </div>
            </div>
            <div>
              <label className="label">Unit System</label>
              <select className="input" defaultValue="imperial">
                <option value="imperial">Imperial (LBS, Miles)</option>
                <option value="metric">Metric (KGS, KMS)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div style={{ 
        marginTop: 32, 
        paddingTop: 24, 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12
      }}>
        <button className="btn btn-ghost">Discard Changes</button>
        <button className="btn btn-primary">
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  )
}
