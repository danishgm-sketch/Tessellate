import type { Env } from './types.js';
import { ConfigurationError, isNonProduction } from './security.js';

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Development/test outbox: emails are captured here instead of being sent. */
const outbox: Array<OutgoingEmail & { sentAt: string }> = [];

export function readDevOutbox(): ReadonlyArray<OutgoingEmail & { sentAt: string }> {
  return outbox;
}

export function clearDevOutbox(): void {
  outbox.length = 0;
}

const DEFAULT_FROM = { email: 'no-reply@tessellate.design', name: 'Tessellate' };

/**
 * Sends a transactional email through the Cloudflare Email Service binding (D-037).
 * Development/test environments without the binding capture mail in an in-memory outbox;
 * production without the binding fails loudly rather than silently dropping account email.
 */
export async function sendEmail(env: Env | undefined, message: OutgoingEmail): Promise<void> {
  if (env?.EMAIL) {
    await env.EMAIL.send({
      to: message.to,
      from: env.EMAIL_FROM ? { email: env.EMAIL_FROM, name: 'Tessellate' } : DEFAULT_FROM,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return;
  }
  if (isNonProduction(env)) {
    outbox.push({ ...message, sentAt: new Date().toISOString() });
    return;
  }
  throw new ConfigurationError('Email sending (EMAIL binding) is not configured.');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

/** Plain, accessible transactional layout (single action button + text fallback). */
export function accountEmail(opts: { to: string; subject: string; greetingName?: string; intro: string; actionLabel: string; actionUrl: string; footer: string }): OutgoingEmail {
  const hello = opts.greetingName ? `Hi ${opts.greetingName},` : 'Hi,';
  const text = `${hello}\n\n${opts.intro}\n\n${opts.actionLabel}: ${opts.actionUrl}\n\n${opts.footer}\n\n— Tessellate`;
  const html = `<!doctype html><html lang="en"><body style="margin:0;padding:24px;background:#F4F2ED;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111217">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #D9D6CF;border-radius:10px">
<tr><td style="padding:28px">
<p style="margin:0 0 16px;font-size:15px">${escapeHtml(hello)}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55">${escapeHtml(opts.intro)}</p>
<p style="margin:0 0 24px"><a href="${escapeHtml(opts.actionUrl)}" style="display:inline-block;background:#2547E8;color:#FFFFFF;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:6px">${escapeHtml(opts.actionLabel)}</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#62666F">If the button does not work, copy this link into your browser:</p>
<p style="margin:0 0 24px;font-size:13px;word-break:break-all"><a href="${escapeHtml(opts.actionUrl)}" style="color:#2547E8">${escapeHtml(opts.actionUrl)}</a></p>
<p style="margin:0;font-size:13px;color:#62666F">${escapeHtml(opts.footer)}</p>
</td></tr></table></body></html>`;
  return { to: opts.to, subject: opts.subject, text, html };
}
