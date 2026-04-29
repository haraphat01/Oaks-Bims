import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Oaks & Bims <onboarding@resend.dev>";

/** ----------- Email templates ----------- */

export function subscribeConfirmEmail(opts: {
  fullName?: string | null;
  confirmUrl: string;
}) {
  const name = opts.fullName ? opts.fullName.split(" ")[0] : "there";
  return {
    subject: "Confirm your subscription — Oaks & Bims",
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:22px;margin:0 0 16px">One last step, ${name}.</h1>
        <p style="line-height:1.6">Confirm your email so we can send you our weekly digest of new properties across Nigeria — curated for buyers at home and in the diaspora.</p>
        <p style="margin:28px 0">
          <a href="${opts.confirmUrl}" style="background:#0f5132;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">Confirm subscription</a>
        </p>
        <p style="color:#64748b;font-size:13px">If you didn't sign up, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#64748b;font-size:12px">Oaks &amp; Bims Nigeria Limited · oaksandbims.com</p>
      </div>
    `,
  };
}

export function newListingsEmail(opts: {
  fullName?: string | null;
  unsubUrl: string;
  properties: Array<{ title: string; city: string; state: string; priceNgn: number; url: string; image?: string | null }>;
}) {
  const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
  const cards = opts.properties
    .map(
      (p) => `
      <tr><td style="padding:12px 0">
        <a href="${p.url}" style="text-decoration:none;color:inherit">
          <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
            ${p.image ? `<tr><td><img src="${p.image}" alt="" style="width:100%;height:200px;object-fit:cover;display:block"/></td></tr>` : ""}
            <tr><td style="padding:16px">
              <div style="font-weight:600;font-size:16px;color:#0f172a">${p.title}</div>
              <div style="color:#64748b;font-size:14px;margin-top:4px">${p.city}, ${p.state}</div>
              <div style="margin-top:8px;font-weight:700;color:#0f5132">${fmt(p.priceNgn)}</div>
            </td></tr>
          </table>
        </a>
      </td></tr>`
    )
    .join("");

  return {
    subject: "New properties this week — Oaks & Bims",
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:22px;margin:0 0 8px">New on Oaks &amp; Bims</h1>
        <p style="color:#64748b;margin:0 0 16px">Hand-picked listings, fresh this week.</p>
        <table width="100%" cellspacing="0" cellpadding="0">${cards}</table>
        <p style="margin-top:24px;color:#64748b;font-size:12px">
          Don't want these emails? <a href="${opts.unsubUrl}" style="color:#64748b">Unsubscribe</a>.
        </p>
      </div>
    `,
  };
}

export function magicLinkEmail(opts: { magicLink: string }) {
  return {
    subject: "Your sign-in link — Oaks & Bims",
    html: authEmailShell({
      heading: "Sign in to Oaks &amp; Bims",
      body: "Click the button below to sign in. This link is valid for 1 hour.",
      ctaLabel: "Sign in",
      ctaUrl: opts.magicLink,
      footnote: "If you didn't request this, you can safely ignore it.",
    }),
  };
}

export function authConfirmEmail(opts: {
  fullName?: string | null;
  confirmUrl: string;
  isEmailChange?: boolean;
}) {
  const name = opts.fullName ? opts.fullName.split(" ")[0] : "there";
  return opts.isEmailChange
    ? {
        subject: "Confirm your new email address — Oaks & Bims",
        html: authEmailShell({
          heading: `Confirm your new email, ${name}.`,
          body: "We received a request to update the email address on your Oaks &amp; Bims account. Click the button below to confirm the change.",
          ctaLabel: "Confirm new email",
          ctaUrl: opts.confirmUrl,
          footnote: "If you didn't request this change, please ignore this email — your address won't be updated.",
        }),
      }
    : {
        subject: "Confirm your email — Oaks & Bims",
        html: authEmailShell({
          heading: `Welcome, ${name}. One last step.`,
          body: "Thanks for creating your Oaks &amp; Bims account. Click the button below to confirm your email and activate your account.",
          ctaLabel: "Confirm email",
          ctaUrl: opts.confirmUrl,
          footnote: "If you didn't sign up, you can safely ignore this email.",
        }),
      };
}

export function passwordResetEmail(opts: {
  fullName?: string | null;
  resetUrl: string;
}) {
  const name = opts.fullName ? opts.fullName.split(" ")[0] : "there";
  return {
    subject: "Reset your password — Oaks & Bims",
    html: authEmailShell({
      heading: `Reset your password, ${name}.`,
      body: "We received a request to reset the password on your Oaks &amp; Bims account. Click the button below to create a new one. This link expires in 1 hour.",
      ctaLabel: "Reset password",
      ctaUrl: opts.resetUrl,
      footnote: "If you didn't request a password reset, you can safely ignore this email — your password won't change.",
    }),
  };
}

/** Shared HTML shell for all auth-related emails. */
function authEmailShell(opts: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,sans-serif">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr><td style="background:#0f5132;padding:28px 36px">
          <table cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:36px;height:36px;background:white;border-radius:7px;text-align:center;vertical-align:middle">
                <span style="color:#0f5132;font-size:20px;font-weight:800;font-family:Georgia,serif;line-height:36px">O</span>
              </td>
              <td style="padding-left:12px">
                <span style="color:white;font-weight:700;font-size:17px">Oaks &amp; Bims</span><br/>
                <span style="color:rgba(255,255,255,.55);font-size:11px;letter-spacing:.1em;text-transform:uppercase">Nigeria Limited</span>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 36px 28px">
          <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3">${opts.heading}</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#475569">${opts.body}</p>
          <a href="${opts.ctaUrl}"
             style="display:inline-block;background:#0f5132;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px">
            ${opts.ctaLabel}
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.6">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${opts.ctaUrl}" style="color:#0f5132;word-break:break-all">${opts.ctaUrl}</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="border-top:1px solid #e2e8f0;padding:20px 36px;background:#f8fafc">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
            ${opts.footnote}<br/>
            &mdash; Oaks &amp; Bims Nigeria Limited &nbsp;·&nbsp; RC: 1754177
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function adminInquiryAlertEmail(opts: {
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  message: string;
  propertyTitle?: string | null;
  adminUrl: string;
}) {
  const rows = [
    opts.propertyTitle
      ? `<tr><td style="color:#64748b;padding:6px 12px 6px 0;white-space:nowrap">Property</td><td style="font-weight:500;padding:6px 0">${opts.propertyTitle}</td></tr>`
      : "",
    `<tr><td style="color:#64748b;padding:6px 12px 6px 0;white-space:nowrap">From</td><td style="font-weight:500;padding:6px 0">${opts.fullName}</td></tr>`,
    `<tr><td style="color:#64748b;padding:6px 12px 6px 0;white-space:nowrap">Email</td><td style="font-weight:500;padding:6px 0">${opts.email}</td></tr>`,
    opts.phone
      ? `<tr><td style="color:#64748b;padding:6px 12px 6px 0;white-space:nowrap">Phone</td><td style="font-weight:500;padding:6px 0">${opts.phone}</td></tr>`
      : "",
    opts.country
      ? `<tr><td style="color:#64748b;padding:6px 12px 6px 0;white-space:nowrap">Country</td><td style="font-weight:500;padding:6px 0">${opts.country}</td></tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return {
    subject: `New inquiry from ${opts.fullName} — Oaks & Bims`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:20px;margin:0 0 16px">New inquiry received</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">${rows}</table>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:14px;line-height:1.6;white-space:pre-wrap">${opts.message}</div>
        <p style="margin:20px 0">
          <a href="${opts.adminUrl}" style="background:#0f5132;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">View in admin panel</a>
        </p>
        <p style="color:#64748b;font-size:12px">Oaks &amp; Bims Nigeria Limited</p>
      </div>
    `,
  };
}

export function savedSearchAlertEmail(opts: {
  email: string;
  label?: string | null;
  searchUrl: string;
  unsubUrl: string;
  properties: Array<{ title: string; city: string; state: string; priceNgn: number; url: string; image?: string | null }>;
}) {
  const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
  const heading = opts.label ? `New matches for "${opts.label}"` : "New properties matching your saved search";
  const cards = opts.properties
    .map(
      (p) => `
      <tr><td style="padding:10px 0">
        <a href="${p.url}" style="text-decoration:none;color:inherit">
          <table width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
            ${p.image ? `<tr><td><img src="${p.image}" alt="" style="width:100%;height:180px;object-fit:cover;display:block"/></td></tr>` : ""}
            <tr><td style="padding:14px">
              <div style="font-weight:600;font-size:15px;color:#0f172a">${p.title}</div>
              <div style="color:#64748b;font-size:13px;margin-top:3px">${p.city}, ${p.state}</div>
              <div style="margin-top:6px;font-weight:700;color:#0f5132">${fmt(p.priceNgn)}</div>
            </td></tr>
          </table>
        </a>
      </td></tr>`
    )
    .join("");

  return {
    subject: `${heading} — Oaks & Bims`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:20px;margin:0 0 6px">${heading}</h1>
        <p style="color:#64748b;margin:0 0 16px">We found ${opts.properties.length} new listing${opts.properties.length === 1 ? "" : "s"} for you.</p>
        <table width="100%" cellspacing="0" cellpadding="0">${cards}</table>
        <p style="margin-top:16px">
          <a href="${opts.searchUrl}" style="background:#0f5132;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">View all matches</a>
        </p>
        <p style="margin-top:24px;color:#64748b;font-size:12px">
          You're receiving this because you saved a property search. <a href="${opts.unsubUrl}" style="color:#64748b">Remove this alert</a>.
        </p>
      </div>
    `,
  };
}

export function receiptEmail(opts: {
  receiptNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  propertyTitle?: string | null;
  propertyLocation?: string | null;
  amountNgn: number;
  paymentMethod: string;
  paymentRef?: string | null;
  status: string;
  notes?: string | null;
  receiptUrl: string;
  date: string;
}) {
  const fmt = (n: number) =>
    "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
  const statusColor = opts.status === "paid" ? "#0f5132" : opts.status === "partial" ? "#92400e" : "#991b1b";

  return {
    subject: `Payment receipt ${opts.receiptNumber} — Oaks & Bims`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
        <!-- Header -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px">
          <tr>
            <td>
              <div style="font-weight:700;font-size:18px">Oaks &amp; Bims Nigeria Limited</div>
              <div style="color:#64748b;font-size:12px">Lagos, Nigeria · oaksandbims.com</div>
            </td>
            <td style="text-align:right">
              <span style="background:${statusColor};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase">${opts.status}</span>
            </td>
          </tr>
        </table>

        <h1 style="font-size:22px;margin:0 0 4px">Payment Receipt</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 24px">
          ${opts.receiptNumber} &nbsp;·&nbsp; ${opts.date}
        </p>

        <!-- Buyer / Property -->
        <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px">
          <tr>
            <td style="vertical-align:top;padding-right:16px;width:50%">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px">Received from</div>
              <div style="font-weight:600">${opts.buyerName}</div>
              <div style="color:#64748b;font-size:13px">${opts.buyerEmail}</div>
              ${opts.buyerPhone ? `<div style="color:#64748b;font-size:13px">${opts.buyerPhone}</div>` : ""}
            </td>
            ${opts.propertyTitle ? `
            <td style="vertical-align:top;width:50%">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:6px">For property</div>
              <div style="font-weight:600">${opts.propertyTitle}</div>
              ${opts.propertyLocation ? `<div style="color:#64748b;font-size:13px">${opts.propertyLocation}</div>` : ""}
            </td>` : ""}
          </tr>
        </table>

        <!-- Amount box -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin-bottom:20px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#166534;margin-bottom:4px">Amount paid</div>
          <div style="font-size:28px;font-weight:700;color:#0f5132">${fmt(opts.amountNgn)}</div>
        </div>

        <!-- Payment details -->
        <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;margin-bottom:20px">
          <tr><td style="color:#64748b;padding:4px 0;width:40%">Payment method</td><td style="font-weight:500">${opts.paymentMethod}</td></tr>
          ${opts.paymentRef ? `<tr><td style="color:#64748b;padding:4px 0">Reference</td><td style="font-weight:500">${opts.paymentRef}</td></tr>` : ""}
        </table>

        ${opts.notes ? `
        <div style="background:#f8fafc;border-left:3px solid #e2e8f0;padding:12px 16px;border-radius:0 6px 6px 0;font-size:13px;color:#475569;margin-bottom:20px">${opts.notes}</div>
        ` : ""}

        <p style="margin:20px 0">
          <a href="${opts.receiptUrl}" style="background:#0f5132;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">View receipt online</a>
        </p>

        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="color:#64748b;font-size:12px;margin:0">
          Oaks &amp; Bims Nigeria Limited · RC: 1754177<br/>
          This email confirms payment received. Keep it for your records.
        </p>
      </div>
    `,
  };
}
