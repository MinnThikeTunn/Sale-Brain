import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server";

/** Vercel rewrites to /api/index — restore the browser URL so Express routes match. */
function restoreRequestUrl(req: VercelRequest) {
  const raw =
    req.headers["x-vercel-original-url"] ??
    req.headers["x-invoke-path"] ??
    req.headers["x-forwarded-uri"];

  if (typeof raw !== "string" || !raw) return;

  try {
    const pathname = raw.startsWith("/")
      ? raw.split("?")[0]
      : new URL(raw, "http://localhost").pathname;
    const query =
      req.url && req.url.includes("?")
        ? req.url.slice(req.url.indexOf("?"))
        : raw.includes("?")
          ? raw.slice(raw.indexOf("?"))
          : "";
    req.url = pathname + query;
  } catch {
    // keep default url
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  restoreRequestUrl(req);
  return app(req, res);
}
