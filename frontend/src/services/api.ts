import type { EventFilter, EventListResponse, WebhookEvent } from '../types'

const API_BASE = '/api/v1'

export const api = {
  async fetchEvents(filter: EventFilter, limit = 50, offset = 0): Promise<EventListResponse> {
    const params = new URLSearchParams()
    params.set('limit', limit.toString())
    params.set('offset', offset.toString())

    if (filter.search) params.set('search', filter.search)
    if (filter.method) params.set('method', filter.method)
    if (filter.status) params.set('status', filter.status)
    if (filter.endpointId) params.set('endpoint_id', filter.endpointId)

    const res = await fetch(`${API_BASE}/webhooks?${params.toString()}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`)
    }
    return res.json()
  },

  async fetchEventById(id: string): Promise<WebhookEvent> {
    const res = await fetch(`${API_BASE}/webhooks/${id}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch event detail: ${res.statusText}`)
    }
    return res.json()
  },

  getEventStreamURL(): string {
    return `${API_BASE}/events/stream`
  },
}

// Sensitized headers that must be redacted when copying cURL
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'api-key',
  'apikey',
  'secret',
  'token',
]

export function formatCurlCommand(event: WebhookEvent): string {
  const url = `${window.location.origin}${event.path}`
  const headersList: string[] = []

  if (event.headers) {
    for (const [key, values] of Object.entries(event.headers)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = SENSITIVE_HEADERS.some((s) => lowerKey.includes(s))
      const value = isSensitive ? '[REDACTED_SECRET]' : values.join(', ')
      headersList.push(`  -H "${key}: ${value}" \\`)
    }
  }

  // Format JSON payload nicely
  let formattedPayload = event.payload
  try {
    const parsed = JSON.parse(event.payload)
    formattedPayload = JSON.stringify(parsed)
  } catch {
    // Keep as is
  }

  // Escape double quotes for shell
  const escapedData = formattedPayload.replace(/"/g, '\\"')

  const parts = [
    `curl -X ${event.method} "${url}" \\`,
    ...headersList,
    `  -d "${escapedData}"`,
  ]

  return parts.join('\n')
}
