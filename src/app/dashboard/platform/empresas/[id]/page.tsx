import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/features/auth/services";
import { getCompanyById } from "@/features/company/services";
import { updateCompanyAction, toggleCompanyStatusAction } from "@/features/company/actions";
import { revalidatePath } from "next/cache";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const company = await getCompanyById(id);

  if (!company) {
    notFound();
  }

  async function handleActualizar(formData: FormData) {
    "use server";
    await updateCompanyAction(formData);
    revalidatePath(`/dashboard/platform/empresas/${id}`);
  }

  async function handleToggleStatus() {
    "use server";
    await toggleCompanyStatusAction(id);
    revalidatePath(`/dashboard/platform/empresas/${id}`);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
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
          <Link href="/dashboard/platform/empresas" className="text-stone-600 hover:text-green-700 font-medium">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">{company.name}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                company.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {company.active ? "Activa" : "Inactiva"}
              </span>
              <span className="text-stone-500">NIT: {company.nit}</span>
            </div>
          </div>
          <form action={handleToggleStatus}>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium ${
                company.active
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {company.active ? "Bloquear Empresa" : "Activar Empresa"}
            </button>
          </form>
        </div>

        {/* Información de la Empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Información de la Empresa</h2>

          <form action={handleActualizar} className="space-y-6">
            <input type="hidden" name="id" value={company.id} />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={company.name}
                  required
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">NIT *</label>
                <input
                  type="text"
                  name="nit"
                  defaultValue={company.nit}
                  required
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  defaultValue={company.address || ""}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  defaultValue={company.phone || ""}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Administradores */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-stone-800">Administradores</h2>
            <Link
              href={`/dashboard/platform/empresas/${company.id}/administradores/nuevo`}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              + Agregar Administrador
            </Link>
          </div>

          {company.admins.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-stone-500">No hay administradores asignados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {company.admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{admin.name}</p>
                      <p className="text-sm text-stone-500">{admin.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/platform/usuarios/${admin.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}