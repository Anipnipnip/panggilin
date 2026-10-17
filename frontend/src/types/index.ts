export interface EventSummary {
  id: string
  endpoint_id: string
  method: string
  path: string
  response_status: number
  content_length: number
  received_at: string
}

export interface WebhookEvent {
  id: string
  endpoint_id: string
  method: string
  path: string
  headers: Record<string, string[]>
  payload: string
  remote_addr: string
  content_length: number
  response_status: number
  response_body: string
  duration_ms: number
  received_at: string
}

export interface EventListResponse {
  events: EventSummary[]
  total: number
  limit: number
  offset: number
}

export interface EventFilter {
  search: string
  method: string
  status: string
  endpointId?: string
}

export type Theme = 'dark' | 'light'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}
