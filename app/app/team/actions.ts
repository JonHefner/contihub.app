"use server";

import { revalidatePath } from "next/cache";
import { inviteTeammate } from "@/lib/suite/team";
import { requireStaff } from "@/lib/suite/org";

export async function inviteTeammateAction(email: string) {
  await requireStaff();
  const result = await inviteTeammate(email);
  revalidatePath("/app");
  return {
    subject: result.subject,
    text: result.text,
    mailto: result.mailto,
    magicLink: result.magicLink,
    magicLinkError: result.magicLinkError,
  };
}
