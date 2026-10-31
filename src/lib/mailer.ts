import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transport: Transporter | null = null;

/** A booking must not sit behind a slow mail server for longer than this. */
const SEND_TIMEOUT_MS = 5_000;

/** True once SMTP credentials are present; otherwise mail is logged, not sent. */
export function mailConfigured(): boolean {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = env();
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

/**
 * Sends a message, and never throws.
 *
 * Mail is a side effect of booking, not part of it: an SMTP outage must not
 * cost the customer their reservation, so every failure is logged and swallowed
 * and the caller carries on. With no SMTP settings configured the message is
 * written to the server log, which keeps local development working without a
 * mail account and makes the reference easy to copy during a demo.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const config = env();

  if (!mailConfigured()) {
    console.info(
      `[mail] SMTP not configured — not sent.\n` +
        `       to: ${mail.to}\n    subject: ${mail.subject}\n\n${mail.text}\n`,
    );
    return false;
  }

  try {
    transport ??= nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      // 465 is implicit TLS; 587 upgrades with STARTTLS.
      secure: config.SMTP_PORT === 465,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
      // The customer is waiting on this request, so an unreachable mail server
      // has to fail fast. Without these, nodemailer's own retries held the
      // booking response open for 35 seconds against a dead host.
      connectionTimeout: SEND_TIMEOUT_MS,
      greetingTimeout: SEND_TIMEOUT_MS,
      socketTimeout: SEND_TIMEOUT_MS,
    });

    // A belt-and-braces ceiling: nodemailer's timeouts cover the socket, this
    // covers everything else (DNS, TLS negotiation) that could still hang.
    await Promise.race([
      transport.sendMail({ from: config.MAIL_FROM, ...mail }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timed out")), SEND_TIMEOUT_MS + 1_000).unref(),
      ),
    ]);
    return true;
  } catch (error) {
    console.error(`[mail] failed to send "${mail.subject}" to ${mail.to}`, error);
    return false;
  }
}
