/**
 * Public origin for auth email links and post-OAuth redirects.
 * Prefer NEXT_PUBLIC_SITE_URL when it clearly targets a non-local deployment;
 * if env is localhost but the proxy forwards a real host (e.g. Coolify), trust
 * the proxy; otherwise fall back.
 */
export function getPublicSiteUrl(req: Pick<Request, "headers">): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";

  const isLocalOrigin = (u: string) =>
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(u);

  const fh = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? "";
  const hostOnly = fh.split(":")[0] ?? "";
  const forwardedIsDev = /^(localhost|127\.0\.0\.1)$/i.test(hostOnly);

  // Production behind a reverse proxy while env still points at localhost → use forwarded host.
  if (fh && !forwardedIsDev && (!envUrl || isLocalOrigin(envUrl))) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    return `${proto}://${fh}`.replace(/\/$/, "");
  }

  if (envUrl && !isLocalOrigin(envUrl)) {
    return envUrl;
  }

  if (fh) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (forwardedIsDev ? "http" : "https");
    return `${proto}://${fh}`.replace(/\/$/, "");
  }

  return envUrl || "https://oaksandbims.com";
}
