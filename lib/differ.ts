import { diffLines } from 'diff'
import type { Change } from './types'

export function computeDiff(oldText: string, newText: string, pageId: string, url: string, label: string): Change | null {
  if (oldText === newText) return null

  const parts = diffLines(oldText, newText, { ignoreWhitespace: true })
  const added: string[] = []
  const removed: string[] = []

  for (const p of parts) {
    const lines = p.value.split('\n').map(l => l.trim()).filter(l => l.length > 3)
    if (p.added) added.push(...lines.slice(0, 20))
    else if (p.removed) removed.push(...lines.slice(0, 20))
  }

  const lineCount = added.length + removed.length
  if (lineCount === 0) return null

  let summary = ''
  if (added.length && removed.length) summary = `${added.length} lines added, ${removed.length} removed`
  else if (added.length) summary = `${added.length} new lines detected`
  else summary = `${removed.length} lines removed`

  return {
    id: `${pageId}-${Date.now()}`,
    pageId, url, label,
    detectedAt: new Date().toISOString(),
    added: added.slice(0, 30),
    removed: removed.slice(0, 30),
    summary,
    lineCount,
  }
}
