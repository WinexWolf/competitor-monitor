import nodemailer from 'nodemailer'
import { format } from 'date-fns'
import type { Change } from './types'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendDigest(to: string[], changes: Change[], since: Date) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return { ok: false, error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' }
  }

  const subject = changes.length
    ? `🔍 ${changes.length} competitor change${changes.length > 1 ? 's' : ''} — ${format(new Date(), 'MMM d')}`
    : `✅ No competitor changes this week — ${format(new Date(), 'MMM d')}`

  const html = buildHtml(changes, since)

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `Competitor Monitor <${process.env.GMAIL_USER}>`,
      to: to.join(', '),
      subject,
      html,
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildHtml(changes: Change[], since: Date) {
  const rows = changes.length === 0
    ? `<p style="text-align:center;color:#166534;font-size:16px;padding:24px 0">✅ All monitored pages are unchanged this week.</p>`
    : changes.map(c => `
      <div style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;overflow:hidden">
        <div style="background:#111827;padding:14px 18px">
          <b style="color:#f9fafb">${esc(c.label)}</b>
          <span style="float:right;background:#065f46;color:#6ee7b7;border-radius:99px;padding:2px 10px;font-size:12px">${c.lineCount} changes</span>
          <br><a href="${esc(c.url)}" style="color:#6ee7b7;font-size:12px">${esc(c.url)}</a>
        </div>
        <div style="padding:14px 18px">
          <p style="margin:0 0 10px;color:#374151;font-size:13px">${esc(c.summary)} · ${format(new Date(c.detectedAt), 'MMM d, h:mm a')}</p>
          ${c.added.length ? `
            <p style="margin:0 0 4px;color:#166534;font-size:11px;font-weight:700;text-transform:uppercase">+ Added</p>
            <div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:8px 12px;margin-bottom:8px">
              ${c.added.slice(0, 6).map(l => `<p style="margin:2px 0;font-family:monospace;font-size:11px;color:#166534">${esc(l)}</p>`).join('')}
              ${c.added.length > 6 ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280">…${c.added.length - 6} more</p>` : ''}
            </div>` : ''}
          ${c.removed.length ? `
            <p style="margin:0 0 4px;color:#991b1b;font-size:11px;font-weight:700;text-transform:uppercase">− Removed</p>
            <div style="background:#fef2f2;border-left:3px solid #ef4444;padding:8px 12px">
              ${c.removed.slice(0, 6).map(l => `<p style="margin:2px 0;font-family:monospace;font-size:11px;color:#991b1b">${esc(l)}</p>`).join('')}
              ${c.removed.length > 6 ? `<p style="margin:4px 0 0;font-size:11px;color:#6b7280">…${c.removed.length - 6} more</p>` : ''}
            </div>` : ''}
        </div>
      </div>`).join('')

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:0;margin:0">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px">
      <div style="background:#111827;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px">
        <h1 style="color:#f9fafb;margin:0 0 4px;font-size:22px">${changes.length} Change${changes.length !== 1 ? 's' : ''} Detected</h1>
        <p style="color:#9ca3af;margin:0;font-size:13px">${format(since, 'MMM d')} → ${format(new Date(), 'MMM d, yyyy')}</p>
      </div>
      ${rows}
      <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px">Competitor Monitor</p>
    </div>
  </body></html>`
}
