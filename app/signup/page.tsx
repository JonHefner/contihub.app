import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthPanel
      title="Create an account"
      description="Request access to the Continental Construction of Ohio ops portal."
    >
      <AuthForm mode="signup" />
    </AuthPanel>
  );
}
