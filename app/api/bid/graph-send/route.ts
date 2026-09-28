import { NextResponse } from "next/server";
import { sendInviteeViaGraph } from "@/lib/bid/send";
import { requireStaff } from "@/lib/suite/org";

export async function POST(request: Request) {
  await requireStaff();
  const body = (await request.json().catch(() => null)) as { inviteeId?: string } | null;
  if (!body?.inviteeId) {
    return NextResponse.json({ error: "inviteeId is required." }, { status: 400 });
  }

  try {
    const result = await sendInviteeViaGraph(body.inviteeId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, missing: result.missing },
        { status: result.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Graph send failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
