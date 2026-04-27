import Link from "next/link";
import { getSession, logoutAction } from "@/features/auth/services";
import { getCompanies, getStats } from "@/features/company/services";

export default async function PlatformDashboardPage() {
  const session = await getSession();
  const user = session?.user as { name?: string; email?: string; role?: string };
  const companies = await getCompanies();
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-stone-800">EcoGestión PyME</span>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              Administrador
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-600">{user?.name || user?.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="px-4 py-2 text-stone-700 hover:text-red-600 font-medium">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Panel de Administración</h1>
          <p className="text-stone-600">Gestiona empresas, usuarios y configuración del sistema</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.companies}</div>
            <div className="text-stone-600">Empresas activas</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">{stats.users}</div>
            <div className="text-stone-600">Usuarios registrados</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {companies.length > 0 ? Math.round((companies.filter(c => c.active).length / companies.length) * 100) : 0}%
            </div>
            <div className="text-stone-600">Empresas activas</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="text-3xl font-bold text-purple-600 mb-1">3</div>
            <div className="text-stone-600">Módulos activos</div>
          </div>
        </div>

        {/* Recent Companies */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Empresas Recientes</h2>
            <Link
              href="/dashboard/platform/empresas"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Ver todas →
            </Link>
          </div>

          {companies.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-stone-500 mb-4">No hay empresas registradas aún</p>
              <Link
                href="/dashboard/platform/empresas/nueva"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear primera empresa
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Empresa</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">NIT</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Administradores</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.slice(0, 5).map((company) => (
                    <tr key={company.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">{company.name}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{company.nit}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          company.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {company.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{company.admins.length}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/platform/empresas/${company.id}`}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Gestión de Empresas</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/platform/empresas"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Ver todas las empresas</div>
                  <div className="text-sm text-stone-500">Lista y estado de empresas</div>
                </div>
              </Link>
              <Link
                href="/dashboard/platform/empresas/nueva"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Crear nueva empresa</div>
                  <div className="text-sm text-stone-500">Registrar empresa en el sistema</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Gestión de Usuarios</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/platform/usuarios"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Ver todos los usuarios</div>
                  <div className="text-sm text-stone-500">Administradores de empresas</div>
                </div>
              </Link>
              <Link
                href="/dashboard/platform/usuarios/nuevo"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Crear usuario administrador</div>
                  <div className="text-sm text-stone-500">Asignar a una empresa</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Configuración</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/platform/configuracion"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Módulos del sistema</div>
                  <div className="text-sm text-stone-500">Activar residuos, agua, energía</div>
                </div>
              </Link>
              <Link
                href="/dashboard/platform/normatividad"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Requisitos legales</div>
                  <div className="text-sm text-stone-500">Decreto 1076, Resolución 631</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-xl font-semibold text-stone-800 mb-4">Reportes</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/platform/reportes"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Reporte general</div>
                  <div className="text-sm text-stone-500">Estado del sistema</div>
                </div>
              </Link>
              <Link
                href="/dashboard/platform/reportes/cumplimiento"
                className="flex items-center gap-3 p-4 border border-stone-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-stone-900">Reporte de cumplimiento</div>
                  <div className="text-sm text-stone-500">Por empresa y norma</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}