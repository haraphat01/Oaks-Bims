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
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:22px;margin:0 0 16px">Sign in to Oaks &amp; Bims</h1>
        <p>Click the link below to sign in. It's good for 1 hour.</p>
        <p style="margin:28px 0">
          <a href="${opts.magicLink}" style="background:#0f5132;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">Sign in</a>
        </p>
        <p style="color:#64748b;font-size:13px">If you didn't request this, just ignore the email.</p>
      </div>
    `,
  };
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
