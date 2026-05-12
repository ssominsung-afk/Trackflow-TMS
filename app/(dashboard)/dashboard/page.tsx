import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  let loads: any[] = []
  let error: any = null
  
  try {
    const supabase = await createClient()
    const result = await supabase.from('loads').select('*').limit(5)
    loads = result.data || []
    error = result.error
  } catch (e: any) {
    error = e
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Operations Overview (Debug Mode)</h1>
      {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg mb-4">Error: {error.message || String(error)}</div>}
      <p className="mb-4">Total loads found: {loads.length}</p>
      <div className="space-y-2">
        {loads.map((l: any) => (
          <div key={l.id} className="p-3 bg-zinc-900 rounded border border-zinc-800">
            {l.load_number} - {l.status}
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-zinc-500">If you see this, the page is rendering correctly.</p>
    </div>
  )
}
