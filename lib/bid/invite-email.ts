export type BidInviteEmailInput = {
  projectName: string;
  packageTitle: string;
  dueLabel: string;
  trade: string;
  username: string;
  magicLink: string | null;
  drawingsUrl: string;
  fromMailbox: string;
  buildingConnectedSent: boolean;
  bidPath?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function safeHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.toString();
    }
  } catch {
    return "";
  }
  return "";
}

function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return "https://www.contihub.app";
  }
  try {
    const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (url.hostname === "contihub.app") {
      return "https://www.contihub.app";
    }
    return url.origin;
  } catch {
    return "https://www.contihub.app";
  }
}

export function bidInviteUrl(bidPath = "/app/bid/invitations") {
  return `${siteOrigin()}${bidPath.startsWith("/") ? bidPath : `/${bidPath}`}`;
}

export function buildBidInviteEmail(input: BidInviteEmailInput) {
  const bidUrl = bidInviteUrl(input.bidPath);
  const drawings = safeHttpUrl(input.drawingsUrl);
  const magic = input.magicLink ? safeHttpUrl(input.magicLink) : "";
  const mailbox = input.fromMailbox.trim();
  const subject = `Conti Bid invitation — ${input.projectName} — ${input.trade || input.packageTitle}`;

  const bcLine = input.buildingConnectedSent
    ? "A Building Connected invitation was also sent. Conti Bid does not replace that invitation."
    : "Building Connected, if used for this package, is a separate invitation. Conti Bid does not replace it.";

  const signInLine = magic
    ? "Use the magic link in this email to sign in. There is no temporary password. Your username is your work email."
    : "Your username is your work email. A one-click magic link was not minted in this environment (set SUPABASE_SERVICE_ROLE_KEY). Open Conti Bid and request a sign-in link for this address.";

  const text = [
    "Continental Construction of Ohio",
    "Conti Bid invitation",
    "",
    `Project: ${input.projectName}`,
    `Package: ${input.packageTitle}`,
    `Trade: ${input.trade || "—"}`,
    `Bid due: ${input.dueLabel || "—"}`,
    "",
    "Your Conti Bid access is included in this invitation.",
    `Username: ${input.username}`,
    signInLine,
    magic ? `Magic link: ${magic}` : "",
    `Conti Bid: ${bidUrl}`,
    drawings ? `Drawings (Teams): ${drawings}` : "Drawings: Teams link not attached yet.",
    "",
    bcLine,
    mailbox ? `Send from: ${mailbox}` : "Send from the Conti estimator mailbox configured as CONTI_BID_FROM_MAILBOX.",
    "",
    "Continental Construction of Ohio · The Conti Way",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const button = magic
    ? `<a href="${escapeHtml(magic)}" style="display:inline-block;background:#c9a34a;color:#14120e;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:2px;">Open Conti Bid</a>`
    : `<a href="${escapeHtml(bidUrl)}" style="display:inline-block;background:#c9a34a;color:#14120e;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:2px;">Go to Conti Bid</a>`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#121418;color:#f4efe4;font-family:Georgia,serif;">
    <div style="max-width:640px;margin:0 auto;padding:28px 20px;">
      <p style="letter-spacing:0.18em;text-transform:uppercase;color:#c9a34a;font-size:12px;font-family:Arial,sans-serif;">Continental Construction of Ohio</p>
      <h1 style="font-size:28px;margin:8px 0 0;">Conti Bid invitation</h1>
      <p style="color:#d9d0c1;line-height:1.5;">Your Conti Bid access is included in this invitation. Username: <strong>${escapeHtml(input.username)}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-family:Arial,sans-serif;font-size:14px;">
        <tr><td style="padding:6px 0;color:#c9a34a;">Project</td><td>${escapeHtml(input.projectName)}</td></tr>
        <tr><td style="padding:6px 0;color:#c9a34a;">Package</td><td>${escapeHtml(input.packageTitle)}</td></tr>
        <tr><td style="padding:6px 0;color:#c9a34a;">Trade</td><td>${escapeHtml(input.trade || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#c9a34a;">Bid due</td><td>${escapeHtml(input.dueLabel || "—")}</td></tr>
      </table>
      <p style="line-height:1.5;">${escapeHtml(signInLine)}</p>
      <p style="margin:22px 0;">${button}</p>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">Conti Bid URL: <a href="${escapeHtml(bidUrl)}" style="color:#c9a34a;">${escapeHtml(bidUrl)}</a></p>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;">${
        drawings
          ? `Drawings (Teams): <a href="${escapeHtml(drawings)}" style="color:#c9a34a;">${escapeHtml(drawings)}</a>`
          : "Drawings: add a Teams link on the bid package. Full file storage comes later."
      }</p>
      <p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#d9d0c1;">${escapeHtml(bcLine)}</p>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#b7ad9d;">${
        mailbox
          ? `Preferred From mailbox: ${escapeHtml(mailbox)}`
          : "Set CONTI_BID_FROM_MAILBOX to the Conti staff mailbox that should send this invitation."
      }</p>
    </div>
  </body>
</html>`;

  const mailto = `mailto:${encodeURIComponent(input.username)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

  return { subject, text, html, mailto, bidUrl };
}
