'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, File, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { DocType } from '@/types'

const DOC_TYPES: DocType[] = ['bol', 'pod', 'lumper', 'scale_ticket', 'photo', 'other']

interface Props {
  loadId: string
  onUploadComplete?: () => void
}

export default function DocumentUploader({ loadId, onUploadComplete }: Props) {
  const [docType, setDocType] = useState<DocType>('pod')
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `loads/${loadId}/${docType}_${Date.now()}.${ext}`

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      // Save to database
      const { error: dbError } = await supabase.from('documents').insert({
        load_id: loadId,
        doc_type: docType,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_size_kb: Math.round(file.size / 1024),
      })

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      if (onUploadComplete) onUploadComplete()
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [loadId, docType, supabase, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label className="label">Document Type</label>
        <select className="input" value={docType} onChange={e => setDocType(e.target.value as DocType)}>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </div>

      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--accent-blue)' : 'var(--border)'}`,
          background: isDragActive ? 'var(--accent-blue-glow)' : 'var(--bg-surface)',
          padding: 32,
          borderRadius: 8,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 size={32} className="animate-spin" color="var(--accent-blue)" />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Uploading...</div>
          </>
        ) : (
          <>
            <UploadCloud size={32} color={isDragActive ? 'var(--accent-blue)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                or click to browse
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
