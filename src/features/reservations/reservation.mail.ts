import "server-only";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { gel, formatLongDay } from "@/lib/format";
import type { ReservationDto } from "@/types";

/**
 * The confirmation email, whose real job is to put the booking reference
 * somewhere the customer still has it tomorrow.
 *
 * The reference is the phone key — lose it and there is no account to log into
 * and no way to unlock the van — so it is stated plainly, twice, and the warning
 * sits next to it rather than in the footer.
 */
export async function sendBookingConfirmation(reservation: ReservationDto): Promise<boolean> {
  const keyUrl = `${env().NEXT_PUBLIC_APP_URL}/keys/${reservation.reference}`;
  const days = reservation.days === 1 ? "1 day" : `${reservation.days} days`;

  const lines = [
    `Hi ${reservation.customer.name},`,
    "",
    `Your ${reservation.van.name} is booked.`,
    "",
    `  Booking reference: ${reservation.reference}`,
    "",
    "KEEP THIS REFERENCE SAFE.",
    "It is also your phone key — it is how you lock and unlock the van, and it is",
    "the only way back into your booking. We cannot recover it for you if it is lost.",
    "",
    `Pickup:  ${formatLongDay(reservation.startDate)}`,
    `Return:  ${formatLongDay(reservation.endDate)}`,
    `Length:  ${days}`,
    `Van:     ${reservation.van.name} (${reservation.van.kind})`,
    `Total:   ${gel(reservation.totalAmount)} (includes ${gel(reservation.cleaningFee)} cleaning)`,
    "",
    `Your phone key: ${keyUrl}`,
    "",
    "Chavchavadze Ave 37, Tbilisi",
    "Insurance and unlimited kilometres included.",
  ];

  return sendMail({
    to: reservation.customer.email,
    subject: `Your VanHop booking ${reservation.reference} — keep this reference`,
    text: lines.join("\n"),
    html: html(reservation, keyUrl, days),
  });
}

function html(reservation: ReservationDto, keyUrl: string, days: string): string {
  const row = (label: string, value: string): string =>
    `<tr>
       <td style="padding:9px 0;color:#5A6474;font-size:14px;">${esc(label)}</td>
       <td style="padding:9px 0;text-align:right;font-size:14px;font-weight:600;color:#0E1626;">${esc(value)}</td>
     </tr>`;

  return `<!doctype html>
<html lang="en"><body style="margin:0;background:#F4F5F7;padding:28px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#0E1626;padding:22px 28px;color:#ffffff;font-size:19px;font-weight:800;">VanHop</td></tr>

    <tr><td style="padding:28px;">
      <p style="margin:0 0 6px;font-size:21px;font-weight:700;color:#0E1626;">You&rsquo;re booked, ${esc(reservation.customer.name)}.</p>
      <p style="margin:0 0 22px;font-size:14px;color:#5A6474;">Your ${esc(reservation.van.name)} is reserved.</p>

      <div style="border:2px solid #0E1626;border-radius:12px;padding:16px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#5A6474;letter-spacing:.08em;text-transform:uppercase;">Booking reference</p>
        <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:.16em;color:#0E1626;">${esc(reservation.reference)}</p>
      </div>

      <div style="margin:16px 0 0;border-radius:10px;background:#FFF6E6;border:1px solid #E7CFA0;padding:14px 16px;">
        <p style="margin:0;font-size:13.5px;line-height:1.55;color:#6B4E10;">
          <b>Keep this reference safe.</b> It is also your phone key &mdash; it is how you lock and
          unlock the van, and it is the only way back into your booking. There is no account and no
          password, so we cannot recover it for you if it is lost.
        </p>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #E6E8EC;">
        ${row("Van", `${reservation.van.name} · ${reservation.van.kind}`)}
        ${row("Pickup", formatLongDay(reservation.startDate))}
        ${row("Return", formatLongDay(reservation.endDate))}
        ${row("Length", days)}
        ${row("Cleaning", gel(reservation.cleaningFee))}
        <tr><td style="padding:12px 0 0;border-top:1px solid #E6E8EC;font-size:15px;font-weight:800;color:#0E1626;">Total</td>
            <td style="padding:12px 0 0;border-top:1px solid #E6E8EC;text-align:right;font-size:15px;font-weight:800;color:#0E1626;">${esc(gel(reservation.totalAmount))}</td></tr>
      </table>

      <p style="margin:26px 0 0;text-align:center;">
        <a href="${esc(keyUrl)}" style="display:inline-block;background:#0E1626;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:999px;font-size:14.5px;font-weight:700;">Open your phone key</a>
      </p>
      <p style="margin:12px 0 0;text-align:center;font-size:12px;color:#8A93A3;word-break:break-all;">${esc(keyUrl)}</p>
    </td></tr>

    <tr><td style="padding:18px 28px;background:#F4F5F7;font-size:12px;color:#8A93A3;">
      VanHop &middot; Chavchavadze Ave 37, Tbilisi &middot; Insurance and unlimited kilometres included.
    </td></tr>
  </table>
</body></html>`;
}

/** Customer-supplied values land in this HTML, so they get escaped. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
