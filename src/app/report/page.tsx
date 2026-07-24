import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import ReportForm from "@/components/ReportForm";

export const dynamic = "force-dynamic";

interface ReportPageProps {
  searchParams: Promise<{ number?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/report");
  }

  const resolvedParams = await searchParams;
  const initialNumber = resolvedParams?.number ? decodeURIComponent(resolvedParams.number) : "";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <ReportForm initialNumber={initialNumber} userEmail={session.user.email || ""} />
    </div>
  );
}
