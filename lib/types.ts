export interface Page {
  id: string
  url: string
  label: string
  addedAt: string
  lastChecked?: string
  lastChanged?: string
  status: 'active' | 'error' | 'blocked'
  errorMessage?: string
}

export interface Snapshot {
  pageId: string
  content: string
  hash: string
  capturedAt: string
}

export interface Change {
  id: string
  pageId: string
  url: string
  label: string
  detectedAt: string
  added: string[]
  removed: string[]
  summary: string
  lineCount: number
}
