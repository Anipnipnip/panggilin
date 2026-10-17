import React, { useState } from 'react'
import { Plus, Copy, Check, Layers, ArrowUpRight, ShieldCheck } from 'lucide-react'

interface ReplayDestination {
  id: string
  name: string
  url: string
  status: 'active' | 'inactive'
  created_at: string
}

interface EndpointsViewProps {
  onNotify: (msg: string) => void
}

export const EndpointsView: React.FC<EndpointsViewProps> = ({ onNotify }) => {
  const [copiedIncoming, setCopiedIncoming] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [destinations, setDestinations] = useState<ReplayDestination[]>([
    {
      id: 'dest-1',
      name: 'Local Backend (Dev Server)',
      url: 'http://localhost:3000/api/webhook',
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ])

  const incomingUrl = `${window.location.protocol}//${window.location.hostname}:8080/api/v1/webhooks`

  const handleCopyIncoming = async () => {
    try {
      await navigator.clipboard.writeText(incomingUrl)
      setCopiedIncoming(true)
      onNotify('Alamat Incoming Endpoint disalin!')
      setTimeout(() => setCopiedIncoming(false), 2000)
    } catch {
      onNotify('Gagal menyalin URL')
    }
  }

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) {
      onNotify('Nama dan URL wajib diisi!')
      return
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      onNotify('URL harus diawali dengan http:// atau https://')
      return
    }

    const newDest: ReplayDestination = {
      id: `dest-${Date.now()}`,
      name,
      url,
      status: 'active',
      created_at: new Date().toISOString(),
    }

    setDestinations([...destinations, newDest])
    setName('')
    setUrl('')
    setIsDialogOpen(false)
    onNotify('Tujuan Replay berhasil ditambahkan!')
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Incoming Endpoints */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Incoming Endpoints</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', maxWidth: '640px' }}>
          Alamat HTTP endpoint Panggilin untuk menerima webhook dari layanan eksternal (payment gateway, bot, logistik). Arahkan webhook provider Anda ke alamat berikut:
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            maxWidth: '680px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Default Ingestion Endpoint:</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--accent-text)' }}>
              {incomingUrl}
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleCopyIncoming}>
            {copiedIncoming ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedIncoming ? 'Tersalin' : 'Salin URL'}</span>
          </button>
        </div>
      </div>

      {/* 2. Replay Destinations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Tujuan Replay (Replay Destinations)</h2>
          </div>
          <button className="btn btn-primary" onClick={() => setIsDialogOpen(true)}>
            <Plus size={14} />
            <span>Add Endpoint</span>
          </button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', maxWidth: '640px' }}>
          Alamat server lokal atau staging Anda yang akan menerima request saat Anda menekan tombol Replay pada inspeksi webhook.
        </p>

        <div style={{ maxWidth: '800px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table className="events-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>URL Tujuan</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{d.url}</td>
                  <td>
                    <span className="badge badge-status-2xx">
                      <ShieldCheck size={11} /> {d.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog Add Destination */}
      {isDialogOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
          onClick={() => setIsDialogOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Tambah Tujuan Replay</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Daftarkan URL aplikasi lokal atau staging yang akan menerima request replay.
            </p>

            <form onSubmit={handleAddDestination} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Nama Endpoint:
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '10px' }}
                  placeholder="Contoh: Local Next.js App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  URL Tujuan:
                </label>
                <input
                  type="url"
                  className="search-input"
                  style={{ paddingLeft: '10px', fontFamily: 'var(--font-mono)' }}
                  placeholder="http://localhost:3000/api/webhook"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
