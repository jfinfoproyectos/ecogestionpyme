"use client";

import Link from "next/link";
import { handleBloquear, handleEliminar } from "./companyActions";

interface Company {
  id: string;
  name: string;
  nit: string;
  phone?: string | null;
  address?: string | null;
  active: boolean;
  admins: { id: string }[];
}

interface CompanyTableProps {
  companies: Company[];
}

export default function CompanyTable({ companies }: CompanyTableProps) {
  return (
    <table className="w-full">
      <thead className="bg-stone-50 border-b border-stone-200">
        <tr>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">Empresa</th>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">NIT</th>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">Teléfono</th>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">Estado</th>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">Administradores</th>
          <th className="text-left py-4 px-6 font-semibold text-stone-700">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {companies.map((company) => (
          <tr key={company.id} className="border-b border-stone-100 hover:bg-stone-50">
            <td className="py-4 px-6">
              <div className="font-medium text-stone-900">{company.name}</div>
              <div className="text-sm text-stone-500">{company.address || "Sin dirección"}</div>
            </td>
            <td className="py-4 px-6 text-stone-600">{company.nit}</td>
            <td className="py-4 px-6 text-stone-600">{company.phone || "-"}</td>
            <td className="py-4 px-6">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                company.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {company.active ? "Activa" : "Inactiva"}
              </span>
            </td>
            <td className="py-4 px-6 text-stone-600">{company.admins.length}</td>
            <td className="py-4 px-6">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/platform/empresas/${company.id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver/Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <form action={handleBloquear}>
                  <input type="hidden" name="id" value={company.id} />
                  <button
                    type="submit"
                    className={`p-2 rounded-lg transition-colors ${
                      company.active
                        ? "text-yellow-600 hover:bg-yellow-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={company.active ? "Bloquear" : "Activar"}
                  >
                    {company.active ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </form>
                <form action={handleEliminar}>
                  <input type="hidden" name="id" value={company.id} />
                  <button
                    type="submit"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                    onClick={(e) => {
                      if (!confirm("¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}