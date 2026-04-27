"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCompanyAction } from "@/features/company/actions";

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createCompanyAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/platform/empresas");
      }
    });
  };

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

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Crear Nueva Empresa</h1>
          <p className="text-stone-600">Registra una nueva empresa en el sistema</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de la Empresa */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-stone-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                placeholder="Ej: Textiles Itagüí S.A.S"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* NIT */}
            <div>
              <label htmlFor="nit" className="block text-sm font-medium text-stone-700 mb-2">
                NIT *
              </label>
              <input
                id="nit"
                name="nit"
                type="text"
                required
                placeholder="Ej: 901234567-1"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label htmlFor="ciudad" className="block text-sm font-medium text-stone-700 mb-2">
                Ciudad *
              </label>
              <select
                id="ciudad"
                name="ciudad"
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Medellín">Medellín</option>
                <option value="Itagüí">Itagüí</option>
                <option value="Bello">Bello</option>
                <option value="Envigado">Envigado</option>
                <option value="Sabaneta">Sabaneta</option>
                <option value="La Estrella">La Estrella</option>
                <option value="Caldas">Caldas</option>
                <option value=" Girardota">Girardota</option>
                <option value="Copacabana">Copacabana</option>
                <option value="Barbosa">Barbosa</option>
              </select>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-stone-700 mb-2">
                Dirección
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                placeholder="Ej: Calle 50 #45-67, Zona Industrial"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-stone-700 mb-2">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Ej: 604 123 4567"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-stone-700 mb-2">
                Sector *
              </label>
              <select
                id="sector"
                name="sector"
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar...</option>
                <option value="textil">Textil / Confección</option>
                <option value="agro">Agroindustrial</option>
                <option value="quimico">Químico / Farmacéutico</option>
                <option value="metal">Metalurgia / Metalmecánica</option>
                <option value="electronico">Electrónico / Tecnología</option>
                <option value="construccion">Construcción</option>
                <option value="alimenticio">Alimenticio</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Contrato EPM (opcional) */}
            <div>
              <label htmlFor="contratoEpm" className="block text-sm font-medium text-stone-700 mb-2">
                Número de Contrato EPM
              </label>
              <input
                id="contratoEpm"
                name="contratoEpm"
                type="text"
                placeholder="Ej: 13561195"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-sm text-stone-500">
                Opcional. Permite cargar facturas automáticamente.
              </p>
            </div>

            {/* Administrador */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="font-semibold text-stone-800 mb-4">Administrador de la Empresa</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminNombre" className="block text-sm font-medium text-stone-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    id="adminNombre"
                    name="adminNombre"
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-stone-700 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    required
                    placeholder="Ej: juan@empresa.com"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-stone-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    id="adminPassword"
                    name="adminPassword"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6 border-t border-stone-200">
              <Link
                href="/dashboard/platform/empresas"
                className="px-6 py-3 text-stone-600 hover:text-stone-800 font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isPending ? "Creando..." : "Crear Empresa"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}