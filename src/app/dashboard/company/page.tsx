import Link from "next/link";
import { getSession, logoutAction } from "@/features/auth/services";
import {
  getEnvironmentalStats,
  getAlerts,
  getComplianceRecords,
  getWasteRecords,
  getCompanyByUserId,
} from "@/features/environmental/services";

export default async function CompanyDashboardPage() {
  const session = await getSession();
  const user = session?.user as { name?: string; email?: string; id?: string };

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p>No autenticado. <a href="/login" className="text-green-600">Iniciar sesión</a></p>
      </div>
    );
  }

  const company = await getCompanyByUserId(user.id);

  if (!company) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">No tienes una empresa asignada.</p>
          <form action={logoutAction}>
            <button type="submit" className="px-4 py-2 text-stone-700 hover:text-red-600 font-medium">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  const stats = await getEnvironmentalStats(company.id);
  const alerts = await getAlerts(company.id);
  const compliance = await getComplianceRecords(company.id);
  const recentWaste = (await getWasteRecords(company.id)).slice(0, 3);

  const waterStatus = stats.water.change > 10 ? "warning" : stats.water.change > 0 ? "process" : "good";
  const energyStatus = stats.energy.change > 10 ? "warning" : stats.energy.change > 0 ? "process" : "good";

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
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              {company.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-600">{user.name || user.email}</span>
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
        {/* Dashboard El Semáforo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Panel de Control Ambiental</h1>
          <p className="text-stone-600">{company.name} - {company.nit}</p>
        </div>

        {/* Semáforo - Estado General */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Agua */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Agua</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                waterStatus === "good" ? "bg-green-500" :
                waterStatus === "warning" ? "bg-red-500" : "bg-yellow-500"
              }`}>
                {waterStatus === "good" ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : waterStatus === "warning" ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                )}
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${
              waterStatus === "good" ? "text-green-600" :
              waterStatus === "warning" ? "text-red-600" : "text-yellow-600"
            }`}>
              {waterStatus === "good" ? "Cumple" : waterStatus === "warning" ? "Alerta" : "En Proceso"}
            </p>
            <p className="text-sm text-stone-500">{stats.water.current} m³ este mes</p>
            {stats.water.change !== 0 && (
              <p className={`text-sm mt-1 ${stats.water.change > 0 ? "text-red-600" : "text-green-600"}`}>
                {stats.water.change > 0 ? "+" : ""}{stats.water.change}% vs mes anterior
              </p>
            )}
          </div>

          {/* Energía */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Energía</h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                energyStatus === "good" ? "bg-green-500" :
                energyStatus === "warning" ? "bg-red-500" : "bg-yellow-500"
              }`}>
                {energyStatus === "good" ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                )}
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${
              energyStatus === "good" ? "text-green-600" :
              energyStatus === "warning" ? "text-red-600" : "text-yellow-600"
            }`}>
              {energyStatus === "good" ? "Cumple" : "En Proceso"}
            </p>
            <p className="text-sm text-stone-500">{stats.energy.current} kWh este mes</p>
            {stats.energy.change !== 0 && (
              <p className={`text-sm mt-1 ${stats.energy.change > 0 ? "text-red-600" : "text-green-600"}`}>
                {stats.energy.change > 0 ? "+" : ""}{stats.energy.change}% vs mes anterior
              </p>
            )}
          </div>

          {/* Residuos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-800">Residuos</h3>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">Cumple</p>
            <p className="text-sm text-stone-500">{stats.waste.total} kg en inventario</p>
          </div>
        </div>

        {/* Alertas de Consumo */}
        {alerts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Alertas ({alerts.length})</h3>
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="py-2 border-b border-amber-200 last:border-0">
                    <p className="text-amber-800">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Acceso Rápido */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Registrar Actividad</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/company/residuos"
              className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border-2 border-green-200"
            >
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <span className="font-semibold text-green-800">Residuos</span>
              <span className="text-sm text-green-600">Registrar retales y desechos</span>
            </Link>

            <Link
              href="/dashboard/company/energia-agua"
              className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <span className="font-semibold text-blue-800">Agua y Energía</span>
              <span className="text-sm text-blue-600">Cargar consumo mensual</span>
            </Link>

            <Link
              href="/dashboard/company/mi-empresa"
              className="flex flex-col items-center p-6 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors border-2 border-stone-200"
            >
              <div className="w-14 h-14 bg-stone-500 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-semibold text-stone-800">Mi Empresa</span>
              <span className="text-sm text-stone-600">Configuración</span>
            </Link>

            <Link
              href="/dashboard/company/reportes"
              className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-2 border-purple-200"
            >
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-purple-900">Reportes</span>
              <span className="text-sm text-purple-700">Auditoría y PDFs</span>
            </Link>
          </div>
        </div>

        {/* Cumplimiento Legal */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Cumplimiento Legal</h2>
          {compliance.length === 0 ? (
            <p className="text-stone-500">No hay registros de cumplimiento. <Link href="/dashboard/company/mi-empresa" className="text-green-600">Agregar</Link></p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {compliance.map((record) => (
                <div key={record.id} className={`p-4 rounded-lg border ${
                  record.status === "cumple" ? "bg-green-50 border-green-200" :
                  record.status === "incumple" ? "bg-red-50 border-red-200" :
                  "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-800">{record.norm.toUpperCase()}</p>
                      <p className="text-sm text-stone-500">{record.percentage}% cumplimiento</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status === "cumple" ? "bg-green-500 text-white" :
                      record.status === "incumple" ? "bg-red-500 text-white" :
                      "bg-yellow-500 text-white"
                    }`}>
                      {record.status === "cumple" ? "Cumple" : record.status === "incumple" ? "Incumple" : "En Proceso"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gestión de Residuos */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Gestión de Residuos</h2>
            <Link href="/dashboard/company/residuos" className="text-green-600 hover:text-green-700 font-medium text-sm">
              Ver todos →
            </Link>
          </div>
          {recentWaste.length === 0 ? (
            <p className="text-stone-500">No hay residuos registrados. <Link href="/dashboard/company/residuos" className="text-green-600">Agregar</Link></p>
          ) : (
            <div className="space-y-3">
              {recentWaste.map((waste) => (
                <div key={waste.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      waste.type === "algodon" ? "bg-blue-100 text-blue-700" :
                      waste.type === "poliestar" ? "bg-purple-100 text-purple-700" :
                      waste.type === "denim" ? "bg-indigo-100 text-indigo-700" :
                      "bg-stone-100 text-stone-700"
                    }`}>
                      {waste.type}
                    </span>
                    <span className="font-medium text-stone-800">{waste.weight} kg</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    waste.status === "disponible" ? "bg-green-100 text-green-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {waste.status === "disponible" ? "Disponible" : "Por gestionar"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}