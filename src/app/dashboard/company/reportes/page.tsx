import { getSession } from "@/features/auth/services";
import { getCompanyByUserId } from "@/features/environmental/services";
import ReportsClient from "./ReportsClient";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const company = await getCompanyByUserId((session.user as { id: string }).id);
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-stone-800">No tienes una empresa asignada</h1>
        <p className="text-stone-500">Contacta al administrador para gestionar tus reportes.</p>
      </div>
    );
  }

  return <ReportsClient company={company} />;
}
