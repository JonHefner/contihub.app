export type GraphSendConfig = {
  ready: boolean;
  missing: string[];
  tenantId: string;
  clientId: string;
  clientSecret: string;
  mailbox: string;
};

export function graphSendConfig(env: NodeJS.ProcessEnv = process.env): GraphSendConfig {
  const tenantId = env.MICROSOFT_GRAPH_TENANT_ID?.trim() ?? "";
  const clientId = env.MICROSOFT_GRAPH_CLIENT_ID?.trim() ?? "";
  const clientSecret = env.MICROSOFT_GRAPH_CLIENT_SECRET?.trim() ?? "";
  const mailbox = env.CONTI_BID_FROM_MAILBOX?.trim() ?? "";
  const missing = [
    ["MICROSOFT_GRAPH_TENANT_ID", tenantId],
    ["MICROSOFT_GRAPH_CLIENT_ID", clientId],
    ["MICROSOFT_GRAPH_CLIENT_SECRET", clientSecret],
    ["CONTI_BID_FROM_MAILBOX", mailbox],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return {
    ready: missing.length === 0,
    missing,
    tenantId,
    clientId,
    clientSecret,
    mailbox,
  };
}

export function bidFromMailbox(env: NodeJS.ProcessEnv = process.env) {
  return env.CONTI_BID_FROM_MAILBOX?.trim() ?? "";
}

export async function sendMailViaGraph(
  input: { to: string; subject: string; html: string },
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch,
) {
  const config = graphSendConfig(env);
  if (!config.ready) {
    return { ok: false as const, status: 501, missing: config.missing, error: "Graph send is not configured." };
  }

  const tokenResponse = await fetchImpl(
    `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );

  if (!tokenResponse.ok) {
    return { ok: false as const, status: 502, missing: [], error: "Microsoft token request failed." };
  }

  const tokenBody = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenBody.access_token) {
    return { ok: false as const, status: 502, missing: [], error: "Microsoft token response had no access token." };
  }

  const sendResponse = await fetchImpl(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.mailbox)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenBody.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: input.subject,
          body: { contentType: "HTML", content: input.html },
          toRecipients: [{ emailAddress: { address: input.to } }],
        },
        saveToSentItems: true,
      }),
    },
  );

  if (!sendResponse.ok) {
    return { ok: false as const, status: 502, missing: [], error: "Microsoft Graph sendMail failed." };
  }

  return { ok: true as const, status: 202, missing: [] as string[] };
}
