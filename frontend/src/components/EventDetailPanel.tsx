import React, { useState } from 'react'
import { Copy, Terminal, ChevronLeft, ChevronRight, Eye, EyeOff, Clock, HardDrive, Globe, Hash } from 'lucide-react'
import type { WebhookEvent } from '../types'
import { formatCurlCommand } from '../services/api'

interface EventDetailPanelProps {
  event: WebhookEvent | null
  isLoading: boolean
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  onNotify: (text: string) => void
}

type TabType = 'payload' | 'headers' | 'info' | 'response'

export const EventDetailPanel: React.FC<EventDetailPanelProps> = ({
  event,
  isLoading,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('payload')
  const [showMaskedHeaders, setShowMaskedHeaders] = useState(false)

  if (isLoading) {
    return (
      <aside className="events-detail-pane" style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '32px', width: '100%', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '300px', width: '100%' }} />
      </aside>
    )
  }

  if (!event) {
    return (
      <aside className="events-detail-pane" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>Pilih event dari daftar untuk melihat detail</p>
      </aside>
    )
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      onNotify(`${label} disalin ke clipboard!`)
    } catch {
      onNotify(`Gagal menyalin ${label}`)
    }
  }

  const handleCopyPayload = () => {
    let text = event.payload
    try {
      const parsed = JSON.parse(event.payload)
      text = JSON.stringify(parsed, null, 2)
    } catch {
      // keep raw
    }
    copyToClipboard(text, 'Payload')
  }

  const handleCopyCurl = () => {
    const curl = formatCurlCommand(event)
    copyToClipboard(curl, 'cURL command')
  }

  const handleCopyEventID = () => {
    copyToClipboard(event.id, 'Event ID')
  }

  // Format JSON payload nicely
  let formattedJson = event.payload
  let isJson = false
  try {
    const parsed = JSON.parse(event.payload)
    formattedJson = JSON.stringify(parsed, null, 2)
    isJson = true
  } catch {
    isJson = false
  }

  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'token', 'secret', 'key']

  return (
    <aside className="events-detail-pane">
      {/* Header */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span className="badge badge-method-post">{event.method}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '13px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {event.path}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="btn btn-icon-only"
            disabled={!hasPrevious}
            onClick={onPrevious}
            title="Event sebelumnya"
            aria-label="Previous event"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="btn btn-icon-only"
            disabled={!hasNext}
            onClick={onNext}
            title="Event berikutnya"
            aria-label="Next event"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="detail-actions-toolbar">
        <div className="action-btn-group">
          <button className="btn" onClick={handleCopyPayload} title="Salin JSON Payload">
            <Copy size={13} />
            <span>Copy Payload</span>
          </button>
          <button className="btn" onClick={handleCopyCurl} title="Salin cURL (dengan sensor rahasia)">
            <Terminal size={13} />
            <span>Copy as cURL</span>
          </button>
          <button className="btn" onClick={handleCopyEventID} title="Salin Event ID">
            <Hash size={13} />
            <span>ID</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'payload' ? 'active' : ''}`}
          onClick={() => setActiveTab('payload')}
        >
          Payload
        </button>
        <button
          className={`tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers ({Object.keys(event.headers || {}).length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Request Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'response' ? 'active' : ''}`}
          onClick={() => setActiveTab('response')}
        >
          Response
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'payload' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isJson ? 'application/json (terformat)' : 'raw text'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {event.content_length} bytes
              </span>
            </div>
            <pre className="code-box">
              <code>{formattedJson}</code>
            </pre>
          </div>
        )}

        {activeTab === 'headers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button
                className="btn"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => setShowMaskedHeaders(!showMaskedHeaders)}
              >
                {showMaskedHeaders ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showMaskedHeaders ? 'Samarkan Nilai Sensitif' : 'Tampilkan Rahasia'}</span>
              </button>
            </div>
            <table className="headers-table">
              <tbody>
                {Object.entries(event.headers || {}).map(([key, vals]) => {
                  const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s))
                  const rawVal = vals.join(', ')
                  const displayVal = isSensitive && !showMaskedHeaders ? '••••••••••••••••' : rawVal
                  return (
                    <tr key={key}>
                      <td className="header-key">{key}</td>
                      <td className={`header-val ${isSensitive && !showMaskedHeaders ? 'masked-value' : ''}`}>
                        {displayVal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={12} /> IP Pengirim
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                  {event.remote_addr}
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HardDrive size={12} /> Ukuran Body
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                  {event.content_length} bytes
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> Durasi Pemrosesan
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                  {event.duration_ms} ms
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Hash size={12} /> Endpoint ID
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>
                  {event.endpoint_id}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Waktu Diterima (ISO 8601)</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px' }}>
                {event.received_at}
              </div>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Event UUID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginTop: '4px', wordBreak: 'break-all' }}>
                {event.id}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status Respons Panggilin:</span>
              <span className="badge badge-status-2xx">{event.response_status} OK</span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Response Body:</div>
              <pre className="code-box">
                <code>{event.response_body}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
