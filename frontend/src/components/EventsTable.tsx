import React from 'react'
import type { EventSummary } from '../types'

interface EventsTableProps {
  events: EventSummary[]
  selectedId: string | null
  onSelectEvent: (id: string) => void
  isLoading: boolean
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  selectedId,
  onSelectEvent,
  isLoading,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return isoString
    }
  }

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'badge-method-post'
      case 'GET':
        return 'badge-method-get'
      case 'DELETE':
        return 'badge-method-delete'
      default:
        return 'badge-method-post'
    }
  }

  const getStatusBadgeClass = (status: number) => {
    if (status >= 200 && status < 300) return 'badge-status-2xx'
    if (status >= 400 && status < 500) return 'badge-status-4xx'
    return 'badge-status-5xx'
  }

  if (isLoading && events.length === 0) {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '36px', width: '100%' }} />
        ))}
      </div>
    )
  }

  return (
    <table className="events-table">
      <thead>
        <tr>
          <th style={{ width: '80px' }}>Method</th>
          <th>Path</th>
          <th style={{ width: '80px' }}>Status</th>
          <th style={{ width: '100px', textAlign: 'right' }}>Time</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => {
          const isSelected = e.id === selectedId
          return (
            <tr
              key={e.id}
              className={isSelected ? 'selected' : ''}
              onClick={() => onSelectEvent(e.id)}
              tabIndex={0}
              onKeyDown={(evt) => {
                if (evt.key === 'Enter' || evt.key === ' ') {
                  evt.preventDefault()
                  onSelectEvent(e.id)
                }
              }}
            >
              <td>
                <span className={`badge ${getMethodBadgeClass(e.method)}`}>
                  {e.method}
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                {e.path}
              </td>
              <td>
                <span className={`badge ${getStatusBadgeClass(e.response_status)}`}>
                  {e.response_status}
                </span>
              </td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {formatTime(e.received_at)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
