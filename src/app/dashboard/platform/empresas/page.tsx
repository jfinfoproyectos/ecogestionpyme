import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/features/auth/services";
import { getCompanies } from "@/features/company/services";
import CompanyTable from "@/components/CompanyTable";

export default async function EmpresasPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const companies = await getCompanies();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/platform" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-stone-800">EcoGestión</span>
            </Link>
          </div>
          <Link href="/dashboard/platform" className="text-stone-600 hover:text-green-700 font-medium">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Empresas</h1>
            <p className="text-stone-600">Gestiona todas las empresas registradas</p>
          </div>
          <Link
            href="/dashboard/platform/empresas/nueva"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Empresa
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {companies.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-stone-500 mb-4">No hay empresas registradas aún</p>
              <Link
                href="/dashboard/platform/empresas/nueva"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear primera empresa
              </Link>
            </div>
          ) : (
            <CompanyTable companies={companies} />
          )}
        </div>
      </main>
    </div>
  );
}