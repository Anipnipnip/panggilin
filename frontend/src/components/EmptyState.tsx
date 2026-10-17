import React from 'react'
import { Radio, Copy, Check } from 'lucide-react'

interface EmptyStateProps {
  onCopyCurl: () => void
  copied: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCopyCurl, copied }) => {
  const exampleCurl = `curl -X POST "http://localhost:8080/api/v1/webhooks" \\
  -H "Content-Type: application/json" \\
  -d '{"event":"user.signup","email":"dev@example.com","plan":"pro"}'`

  return (
    <div className="empty-state">
      <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '50%', border: '1px solid var(--border-subtle)' }}>
        <Radio className="empty-icon" />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
        Belum ada webhook yang diterima
      </h3>
      <p style={{ maxWidth: '420px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        Kirim HTTP POST request dengan payload JSON ke endpoint Panggilin di bawah untuk mulai menginspeksi webhook secara langsung.
      </p>

      <div style={{ width: '100%', maxWidth: '520px', textAlign: 'left', marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contoh Request Pengujian:</span>
          <button className="btn" style={{ fontSize: '11px', padding: '3px 8px' }} onClick={onCopyCurl}>
            {copied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            <span>{copied ? 'Tersalin!' : 'Salin Perintah'}</span>
          </button>
        </div>
        <pre className="code-box" style={{ fontSize: '11px' }}>
          <code>{exampleCurl}</code>
        </pre>
      </div>
    </div>
  )
}
