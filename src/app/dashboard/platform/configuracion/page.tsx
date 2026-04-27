"use client";

import { useState } from "react";
import Link from "next/link";

const MODULOS = [
  {
    id: "residuos",
    nombre: "Gestión de Residuos",
    descripcion: "Registro y clasificación de residuos peligrosos y ordinarios",
    icono: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    color: "green",
  },
  {
    id: "agua",
    nombre: "Control de Agua",
    descripcion: "Monitoreo del consumo de agua y detección de ineficiencias",
    icono: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
    color: "blue",
  },
  {
    id: "energia",
    nombre: "Eficiencia Energética",
    descripcion: "Monitoreo del consumo eléctrico y benchmark regional",
    icono: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "yellow",
  },
  {
    id: "simbiosis",
    nombre: "Marketplace de Simbiosis",
    descripcion: "Conexión con gestores autorizados para residuo",
    icono: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "purple",
  },
];

const NORMATIVIDAD = [
  { id: "1076", nombre: "Decreto 1076 de 2015", estado: "activo" },
  { id: "631", nombre: "Resolución 631 de 2015", estado: "activo" },
  { id: "1401", nombre: "Resolución 1401 de 2014", estado: "activo" },
  { id: "1397", nombre: "Resolución 1397 de 2012", estado: "inactivo" },
];

export default function ConfiguracionPage() {
  const [modulos, setModulos] = useState({
    residuos: true,
    agua: true,
    energia: true,
    simbiosis: true,
  });

  const toggleModulo = (id: string) => {
    setModulos({ ...modulos, [id]: !modulos[id as keyof typeof modulos] });
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
          <Link href="/dashboard/platform" className="text-stone-600 hover:text-green-700 font-medium">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Configuración</h1>
          <p className="text-stone-600">Gestiona los módulos activos y la normatividad del sistema</p>
        </div>

        {/* Módulos del Sistema */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Módulos del Sistema</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {MODULOS.map((modulo) => (
              <div
                key={modulo.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  modulos[modulo.id as keyof typeof modulos]
                    ? `border-${modulo.color}-400 bg-${modulo.color}-50`
                    : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      modulos[modulo.id as keyof typeof modulos]
                        ? `bg-${modulo.color}-500`
                        : "bg-stone-300"
                    }`}>
                      <svg className={`w-5 h-5 ${
                        modulos[modulo.id as keyof typeof modulos] ? "text-white" : "text-stone-500"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modulo.icono} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{modulo.nombre}</p>
                      <p className="text-sm text-stone-500">{modulo.descripcion}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleModulo(modulo.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      modulos[modulo.id as keyof typeof modulos] ? "bg-green-500" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        modulos[modulo.id as keyof typeof modulos] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Normatividad */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">Normatividad Legal</h2>
          <div className="space-y-4">
            {NORMATIVIDAD.map((norma) => (
              <div
                key={norma.id}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200"
              >
                <div>
                  <p className="font-medium text-stone-800">{norma.nombre}</p>
                  <p className="text-sm text-stone-500">ID: {norma.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  norma.estado === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-200 text-stone-600"
                }`}>
                  {norma.estado === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-stone-200">
            <button className="w-full py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:border-green-500 hover:text-green-600 transition-colors">
              + Agregar nueva normatividad
            </button>
          </div>
        </div>

        {/* Guardar */}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
            Guardar Cambios
          </button>
        </div>
      </main>
    </div>
  );
}