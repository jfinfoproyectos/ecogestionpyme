"use client";

import { useState } from "react";
import { updateCompanyActivitiesAction } from "@/features/company/actions";
import { createComplianceRecordAction } from "@/features/environmental/actions";
import { useRouter } from "next/navigation";

const NORMATIVIDAD = [
  { id: "1076", nombre: "Decreto 1076 de 2015", descripcion: "Manejo integral de residuos" },
  { id: "631", nombre: "Resolución 631 de 2015", descripcion: "Vertimientos líquidos - sector textil" },
  { id: "1401", nombre: "Resolución 1401 de 2014", descripcion: "Gestión de residuos peligrosos" },
  { id: "1397", nombre: "Resolución 1397 de 2012", descripcion: "huella de carbono corporativa" },
];

const ACTIVIDADES_OPCIONES = [
  { id: "corte", nombre: "Corte de tela", desc: "Actividad básica de manufactura" },
  { id: "costura", nombre: "Costura/Confección", desc: "Ensamblaje de prendas" },
  { id: "estampado", nombre: "Estampado/Bordado", desc: "Decoración de prendas" },
  { id: "tintoreria", nombre: "Tintorería/Teñido", desc: "Proceso de coloración de telas" },
  { id: "lavanderia", nombre: "Lavandería industrial", desc: "Lavado de prendas terminadas" },
];

interface Props {
  company: {
    id: string;
    activities: string[];
  };
  complianceRecords: any[];
}

export default function MyCompanyClient({ company, complianceRecords }: Props) {
  const [actividades, setActividades] = useState<Record<string, boolean>>(
    ACTIVIDADES_OPCIONES.reduce((acc, act) => ({
      ...acc,
      [act.id]: company.activities.includes(act.id)
    }), {})
  );
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showComplianceForm, setShowComplianceForm] = useState(false);
  const router = useRouter();

  const normasActivas = NORMATIVIDAD.filter((n) => {
    if (n.id === "631" && actividades.tintoreria) return true;
    return false;
  });

  const handleSaveActivities = async () => {
    setIsLoading(true);
    const selectedActivities = Object.keys(actividades).filter(id => actividades[id]);
    
    try {
      const result = await updateCompanyActivitiesAction(company.id, selectedActivities);
      if (result.error) {
        alert(result.error);
      } else {
        setStep(2);
        router.refresh();
      }
    } catch (err) {
      alert("Error al guardar las actividades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplianceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await createComplianceRecordAction(formData);
      setShowComplianceForm(false);
      router.refresh();
      alert("Registro de cumplimiento guardado.");
    } catch (err) {
      alert("Error al guardar el cumplimiento.");
    } finally {
      setIsLoading(false);
    }
  };

  const avgCompliance = complianceRecords.length > 0 
    ? Math.round(complianceRecords.reduce((acc, r) => acc + r.percentage, 0) / complianceRecords.length)
    : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Mi Empresa</h1>
        <p className="text-stone-600">Configuración y cumplimiento legal</p>
      </div>

      {/* Asistente Paso a Paso */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? "bg-green-600 text-white" : "bg-stone-200 text-stone-500"
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 ${step > s ? "bg-green-600" : "bg-stone-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Actividades */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Actividades de tu empresa</h2>
            <p className="text-stone-500 mb-6">Selecciona las actividades que realizas. Esto activará los requisitos legales correspondientes.</p>

            <div className="space-y-4">
              {ACTIVIDADES_OPCIONES.map((act) => (
                <label
                  key={act.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    actividades[act.id]
                      ? "border-green-500 bg-green-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={actividades[act.id]}
                    onChange={(e) =>
                      setActividades({ ...actividades, [act.id]: e.target.checked })
                    }
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-stone-800">{act.nombre}</p>
                    <p className="text-sm text-stone-500">{act.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveActivities}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Guardando..." : "Siguiente →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Normatividad */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Normatividad Aplicada</h2>
            <p className="text-stone-500 mb-6">Basado en tus actividades, estas son las normas que aplican:</p>

            <div className="space-y-4 mb-6">
              {normasActivas.length > 0 ? (
                normasActivas.map((norma) => (
                  <div key={norma.id} className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{norma.nombre}</p>
                      <p className="text-sm text-stone-600">{norma.descripcion}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                  <p className="text-stone-600">No hay normatividad adicional requerida para las actividades seleccionadas.</p>
                </div>
              )}

              {/* Normas base que siempre aplican */}
              <div className="flex items-center gap-4 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                <div className="w-10 h-10 bg-stone-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Decreto 1076 de 2015</p>
                  <p className="text-sm text-stone-600">Manejo integral de residuos sólidos - Aplica a todas las empresas</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 text-stone-600 font-medium hover:text-stone-800">← Anterior</button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">Siguiente →</button>
            </div>
          </div>
        )}

        {/* Step 3: Documentos */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Autodiagnóstico de Cumplimiento</h2>
            <p className="text-stone-500 mb-6">Registra el estado de cumplimiento de las normas ambientales.</p>

            <button 
              onClick={() => setShowComplianceForm(!showComplianceForm)}
              className="mb-6 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-black text-sm font-medium"
            >
              {showComplianceForm ? "Cerrar Formulario" : "+ Nuevo Registro de Cumplimiento"}
            </button>

            {showComplianceForm && (
              <form onSubmit={handleComplianceSubmit} className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Norma</label>
                    <select name="norm" className="w-full px-4 py-2 border border-stone-300 rounded-lg">
                      {NORMATIVIDAD.map(n => <option key={n.id} value={n.nombre}>{n.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Estado</label>
                    <select name="status" className="w-full px-4 py-2 border border-stone-300 rounded-lg">
                      <option value="cumple">Cumple</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="pendiente">Pendiente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Porcentaje de Avance</label>
                    <input name="percentage" type="number" min="0" max="100" defaultValue="100" className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Observaciones</label>
                    <input name="observations" type="text" className="w-full px-4 py-2 border border-stone-300 rounded-lg" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      {isLoading ? "Guardando..." : "Guardar Registro"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-3">
              <h3 className="font-medium text-stone-700">Registros guardados</h3>
              {complianceRecords.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No hay registros de cumplimiento aún.</p>
              ) : (
                complianceRecords.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-800">{rec.norm}</p>
                      <p className="text-xs text-stone-500">{new Date(rec.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${rec.status === 'cumple' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {rec.status.toUpperCase()}
                      </span>
                      <p className="text-sm font-bold text-stone-700 mt-1">{rec.percentage}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between mt-8 border-t pt-6">
              <button onClick={() => setStep(2)} className="px-6 py-3 text-stone-600 font-medium hover:text-stone-800">← Anterior</button>
              <button onClick={() => alert("Configuración finalizada")} className="px-6 py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-black">Finalizar</button>
            </div>
          </div>
        )}
      </div>

      {/* Resumen de Cumplimiento */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-semibold text-stone-800 mb-4">Resumen de Cumplimiento Real</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-stone-600">Cumplimiento General (Promedio)</span>
              <span className={`font-medium ${avgCompliance > 80 ? "text-green-600" : "text-yellow-600"}`}>{avgCompliance}%</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3">
              <div className={`${avgCompliance > 80 ? "bg-green-500" : "bg-yellow-500"} h-3 rounded-full transition-all duration-500`} style={{ width: `${avgCompliance}%` }} />
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-4 italic">
            * El cumplimiento se calcula basado en los registros realizados en la pestaña de autodiagnóstico.
          </p>
        </div>
      </div>
    </main>
  );
}
