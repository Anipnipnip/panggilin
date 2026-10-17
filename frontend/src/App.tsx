import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, RefreshCw, Radio, Check, Copy } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { EventsTable } from './components/EventsTable'
import { EventDetailPanel } from './components/EventDetailPanel'
import { EndpointsView } from './components/EndpointsView'
import { EmptyState } from './components/EmptyState'
import { ToastContainer } from './components/Toast'
import { api } from './services/api'
import type { EventSummary, WebhookEvent, EventFilter, Theme, ToastMessage } from './types'

export const App: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('panggilin_theme') as Theme) || 'dark'
  })

  // Navigation & layout
  const [currentTab, setCurrentTab] = useState<'events' | 'endpoints'>('events')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Events & selection
  const [events, setEvents] = useState<EventSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)
  const [isListLoading, setIsListLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // Realtime & New events indicator
  const [sseConnected, setSseConnected] = useState(false)
  const [newEventsCount, setNewEventsCount] = useState(0)

  // Filters
  const [filter, setFilter] = useState<EventFilter>({
    search: '',
    method: '',
    status: '',
  })

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [copiedEmpty, setCopiedEmpty] = useState(false)
  const [copiedTopUrl, setCopiedTopUrl] = useState(false)

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  // Toggle theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('panggilin_theme', nextTheme)
  }

  // Set data-theme on document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Fetch events list
  const loadEvents = useCallback(async (quiet = false) => {
    if (!quiet) setIsListLoading(true)
    try {
      const res = await api.fetchEvents(filter)
      setEvents(res.events || [])
      setNewEventsCount(0)

      // Auto-select first event if none selected
      if (!selectedId && res.events && res.events.length > 0) {
        setSelectedId(res.events[0].id)
      }
    } catch (err) {
      showToast('Gagal memuat daftar webhook', 'error')
    } finally {
      if (!quiet) setIsListLoading(false)
    }
  }, [filter, selectedId, showToast])

  // Initial load and filter change
  useEffect(() => {
    loadEvents()
  }, [filter, loadEvents])

  // Load single event detail when selection changes
  useEffect(() => {
    if (!selectedId) {
      setSelectedEvent(null)
      return
    }

    let isMounted = true
    setIsDetailLoading(true)

    api.fetchEventById(selectedId)
      .then((evt) => {
        if (isMounted) setSelectedEvent(evt)
      })
      .catch(() => {
        if (isMounted) showToast('Gagal memuat detail webhook', 'error')
      })
      .finally(() => {
        if (isMounted) setIsDetailLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedId, showToast])

  // SSE Realtime stream
  useEffect(() => {
    const sseUrl = api.getEventStreamURL()
    const es = new EventSource(sseUrl)

    es.addEventListener('connected', () => {
      setSseConnected(true)
    })

    es.addEventListener('new_webhook', (e: MessageEvent) => {
      try {
        const newSummary: EventSummary = JSON.parse(e.data)
        setEvents((prev) => [newSummary, ...prev])
        setNewEventsCount((c) => c + 1)
      } catch (err) {
        console.error('Failed to parse SSE new_webhook', err)
      }
    })

    es.onerror = () => {
      setSseConnected(false)
    }

    return () => {
      es.close()
    }
  }, [])

  // Navigation Previous / Next in Detail Panel
  const currentIndex = useMemo(() => {
    if (!selectedId) return -1
    return events.findIndex((e) => e.id === selectedId)
  }, [events, selectedId])

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < events.length - 1

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedId(events[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      setSelectedId(events[currentIndex + 1].id)
    }
  }

  const copyTopUrl = async () => {
    const url = `${window.location.protocol}//${window.location.hostname}:8080/api/v1/webhooks`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedTopUrl(true)
      showToast('Alamat Webhook Endpoint disalin!')
      setTimeout(() => setCopiedTopUrl(false), 2000)
    } catch {
      showToast('Gagal menyalin URL', 'error')
    }
  }

  const copyEmptyCurl = async () => {
    const curl = `curl -X POST "http://localhost:8080/api/v1/webhooks" \\\n  -H "Content-Type: application/json" \\\n  -d '{"event":"user.signup","email":"dev@example.com","plan":"pro"}'`
    try {
      await navigator.clipboard.writeText(curl)
      setCopiedEmpty(true)
      showToast('Perintah curl disalin!')
      setTimeout(() => setCopiedEmpty(false), 2000)
    } catch {
      showToast('Gagal menyalin curl', 'error')
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="page-title-group">
            <h1 className="page-title">{currentTab === 'events' ? 'Events' : 'Endpoints'}</h1>
            {currentTab === 'events' && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ({events.length} event)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Incoming URL Pill */}
            <div className="endpoint-banner" onClick={copyTopUrl} style={{ cursor: 'pointer' }} title="Klik untuk menyalin endpoint">
              <span>POST /api/v1/webhooks</span>
              {copiedTopUrl ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            </div>

            {/* Realtime Status Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                background: sseConnected ? 'var(--badge-2xx-bg)' : 'var(--badge-5xx-bg)',
                color: sseConnected ? 'var(--badge-2xx-text)' : 'var(--badge-5xx-text)',
                border: `1px solid ${sseConnected ? 'var(--badge-2xx-border)' : 'var(--badge-5xx-border)'}`,
              }}
              title={sseConnected ? 'Realtime Server-Sent Events aktif' : 'Realtime terputus'}
            >
              <Radio size={11} className={sseConnected ? 'pulse' : ''} />
              <span>{sseConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
        </header>

        {currentTab === 'events' ? (
          <>
            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari berdasarkan path..."
                  value={filter.search}
                  onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                />
              </div>

              <select
                className="select-filter"
                value={filter.method}
                onChange={(e) => setFilter((f) => ({ ...f, method: e.target.value }))}
                aria-label="Filter berdasarkan HTTP Method"
              >
                <option value="">Semua Method</option>
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="DELETE">DELETE</option>
              </select>

              <select
                className="select-filter"
                value={filter.status}
                onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
                aria-label="Filter berdasarkan Status"
              >
                <option value="">Semua Status</option>
                <option value="200">200 OK</option>
                <option value="400">400 Bad Request</option>
                <option value="500">500 Server Error</option>
              </select>

              <button
                className="btn btn-icon-only"
                onClick={() => loadEvents()}
                title="Muat ulang daftar"
                aria-label="Refresh events"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Floating New Events Banner */}
            {newEventsCount > 0 && (
              <div
                className="new-events-banner"
                onClick={() => {
                  setNewEventsCount(0)
                  if (events.length > 0) setSelectedId(events[0].id)
                }}
              >
                <span>↑ {newEventsCount} webhook baru diterima. Klik untuk melihat.</span>
              </div>
            )}

            {/* Split View */}
            <div className="split-view">
              <div className="events-list-pane">
                {events.length === 0 && !isListLoading ? (
                  <EmptyState onCopyCurl={copyEmptyCurl} copied={copiedEmpty} />
                ) : (
                  <EventsTable
                    events={events}
                    selectedId={selectedId}
                    onSelectEvent={(id) => setSelectedId(id)}
                    isLoading={isListLoading}
                  />
                )}
              </div>

              <EventDetailPanel
                event={selectedEvent}
                isLoading={isDetailLoading}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onNotify={showToast}
              />
            </div>
          </>
        ) : (
          <EndpointsView onNotify={showToast} />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
export default App
