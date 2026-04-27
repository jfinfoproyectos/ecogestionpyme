import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/services";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;

  if (role === "PLATFORM_CREATOR") {
    redirect("/dashboard/platform");
  }

  redirect("/dashboard/company");
}