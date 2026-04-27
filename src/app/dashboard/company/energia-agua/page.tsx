import Link from "next/link";
import { getSession } from "@/features/auth/actions";
import { getCompanyByUserId, getEnvironmentalStats, getConsumptionHistory } from "@/features/environmental/actions";
import { redirect } from "next/navigation";
import EnergyWaterClient from "./EnergyWaterClient";

export default async function EnergiaAguaPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id || "";
  const company = await getCompanyByUserId(userId);
  
  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md border border-stone-200">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">No tienes una empresa asignada</h2>
          <p className="text-stone-600 mb-6">Debes estar vinculado a una empresa para gestionar consumos.</p>
          <Link href="/dashboard" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const [stats, history] = await Promise.all([
    getEnvironmentalStats(company.id),
    getConsumptionHistory(company.id)
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/company" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-stone-800">EcoGestión PyME</span>
            </Link>
          </div>
          <Link href="/dashboard/company" className="text-stone-600 hover:text-green-700 font-medium">
            ← Volver
          </Link>
        </div>
      </header>

      <EnergyWaterClient stats={stats} history={history} />
    </div>
  );
}