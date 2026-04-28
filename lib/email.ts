import nodemailer from 'nodemailer'
import { format } from 'date-fns'
import type { Change } from './types'

function transporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── Welcome email ─────────────────────────────────────────────────────────────
export async function sendWelcome(to: string, name: string) {
  if (!process.env.GMAIL_USER) return { ok: false }
  try {
    await transporter().sendMail({
      from: `Peekly 👁 <${process.env.GMAIL_USER}>`,
      to,
      subject: `Welcome to Peekly — let's catch your first competitor move`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0">
        <div style="max-width:560px;margin:0 auto;padding:32px 16px">
          <div style="background:#111118;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px">
            <div style="width:48px;height:48px;background:#22c55e;border-radius:12px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px">👁</div>
            <h1 style="color:#f0f0f5;margin:0 0 6px;font-size:22px">You're in, ${esc(name.split(' ')[0])}.</h1>
            <p style="color:#6b6b85;margin:0;font-size:14px">Welcome to Peekly — your competitors won't know what hit them.</p>
          </div>

          <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e5e7eb">
            <p style="font-size:15px;color:#111;margin:0 0 16px;font-weight:600">Get started in 3 steps:</p>
            ${[
              ['01', 'Add a competitor URL', 'Go to your dashboard and paste in a competitor\'s pricing page, features page, or changelog.'],
              ['02', 'Hit "Check now"', 'This takes your first snapshot — the baseline we\'ll compare against.'],
              ['03', 'Wait for Monday', 'Every Monday morning we\'ll email you exactly what changed. Added in green, removed in red.'],
            ].map(([n, title, body]) => `
              <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start">
                <div style="min-width:28px;height:28px;background:#052e16;border-radius:99px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#22c55e;font-family:monospace">${n}</div>
                <div>
                  <p style="margin:0 0 3px;font-weight:600;font-size:14px;color:#111">${title}</p>
                  <p style="margin:0;font-size:13px;color:#6b7280">${body}</p>
                </div>
              </div>`).join('')}
          </div>

          <div style="text-align:center;padding:16px">
            <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:9px;text-decoration:none">
              Go to my dashboard →
            </a>
          </div>

          <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px">
            Peekly · You're on the free plan (3 pages)
          </p>
        </div>
      </body></html>`,
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Notify you (admin) of new signup ─────────────────────────────────────────
export async function notifyAdminOfSignup(email: string, name: string) {
  if (!process.env.GMAIL_USER || !process.env.ADMIN_EMAIL) return { ok: false }
  try {
    await transporter().sendMail({
      from: `Peekly 👁 <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🎉 New Peekly signup: ${name} (${email})`,
      html: `<p>New user signed up to Peekly:</p>
        <p><strong>Name:</strong> ${esc(name)}<br>
        <strong>Email:</strong> ${esc(email)}<br>
        <strong>Time:</strong> ${new Date().toUTCString()}</p>`,
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false }
  }
}

// ── Immediate change alert ────────────────────────────────────────────────────
export async function sendChangeAlert(to: string, changes: Change[]) {
  if (!process.env.GMAIL_USER || !changes.length) return { ok: false }
  try {
    await transporter().sendMail({
      from: `Peekly 👁 <${process.env.GMAIL_USER}>`,
      to,
      subject: `🔍 Caught one — ${changes.length} competitor change${changes.length > 1 ? 's' : ''} detected`,
      html: buildChangesHtml(changes),
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Weekly digest ─────────────────────────────────────────────────────────────
export async function sendDigest(to: string[], changes: Change[], since: Date) {
  if (!process.env.GMAIL_USER) return { ok: false, error: 'No GMAIL_USER' }

  const subject = changes.length
    ? `🔍 ${changes.length} competitor change${changes.length > 1 ? 's' : ''} this week — ${format(new Date(), 'MMM d')}`
    : `👁 All quiet this week — ${format(new Date(), 'MMM d')}`

  try {
    await transporter().sendMail({
      from: `Peekly 👁 <${process.env.GMAIL_USER}>`,
      to: to.join(', '),
      subject,
      html: changes.length ? buildChangesHtml(changes) : buildQuietHtml(since),
    })
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Shared HTML builders ──────────────────────────────────────────────────────
function buildChangesHtml(changes: Change[]) {
  const rows = changes.map(c => `
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
            ${c.added.length > 6 ? `<p style="font-size:11px;color:#6b7280;margin:4px 0 0">…${c.added.length - 6} more</p>` : ''}
          </div>` : ''}
        ${c.removed.length ? `
          <p style="margin:0 0 4px;color:#991b1b;font-size:11px;font-weight:700;text-transform:uppercase">− Removed</p>
          <div style="background:#fef2f2;border-left:3px solid #ef4444;padding:8px 12px">
            ${c.removed.slice(0, 6).map(l => `<p style="margin:2px 0;font-family:monospace;font-size:11px;color:#991b1b">${esc(l)}</p>`).join('')}
            ${c.removed.length > 6 ? `<p style="font-size:11px;color:#6b7280;margin:4px 0 0">…${c.removed.length - 6} more</p>` : ''}
          </div>` : ''}
      </div>
    </div>`).join('')

  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px">
      <div style="background:#111827;border-radius:10px;padding:24px;text-align:center;margin-bottom:20px">
        <p style="color:#6b6b85;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em">Peekly caught something</p>
        <h1 style="color:#f9fafb;margin:0 0 4px;font-size:22px">${changes.length} Change${changes.length !== 1 ? 's' : ''} Detected</h1>
        <p style="color:#9ca3af;margin:0;font-size:13px">${format(new Date(), 'EEEE, MMM d, yyyy')}</p>
      </div>
      ${rows}
      <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px">
        Peekly · <a href="${process.env.APP_URL}/dashboard" style="color:#6ee7b7">View dashboard</a>
      </p>
    </div>
  </body></html>`
}

function buildQuietHtml(since: Date) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px">
      <div style="background:#111827;border-radius:10px;padding:32px 24px;text-align:center;margin-bottom:20px">
        <div style="font-size:32px;margin-bottom:12px">😴</div>
        <h1 style="color:#f9fafb;margin:0 0 8px;font-size:22px">All quiet this week</h1>
        <p style="color:#9ca3af;margin:0;font-size:14px">None of your tracked pages changed between ${format(since, 'MMM d')} and ${format(new Date(), 'MMM d')}.</p>
      </div>
      <div style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;padding:20px 24px;text-align:center">
        <p style="color:#374151;font-size:14px;margin:0 0 16px">Peekly is still watching. We'll be in touch the moment something moves.</p>
        <a href="${process.env.APP_URL}/dashboard" style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:13px;padding:10px 22px;border-radius:8px;text-decoration:none">View dashboard</a>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px">Peekly</p>
    </div>
  </body></html>`
}
