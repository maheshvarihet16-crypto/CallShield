import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import LinkScannerForm from "@/components/LinkScannerForm";

export const dynamic = "force-dynamic";

export default async function ScanLinkPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/scan-link");
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <LinkScannerForm />
    </div>
  );
}
