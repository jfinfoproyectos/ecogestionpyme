"use client";

import { useState } from "react";
import { 
  createWasteRecordAction, 
  deleteWasteRecordAction, 
  updateWasteRecordAction,
  processWasteManifestAction 
} from "@/features/environmental/actions";
import { useRouter } from "next/navigation";
import HelpModal from "@/features/environmental/components/HelpModal";

const CATEGORIAS = [
  { id: "retal_punto", nombre: "Retal de punto", icon: "👕" },
  { id: "denim", nombre: "Denim", icon: "👖" },
  { id: "mezclas", nombre: "Mezclas", icon: "🧵" },
  { id: "conos", nombre: "Conos plásticos", icon: "🌀" },
  { id: "papel_trazo", nombre: "Papel de trazo", icon: "📄" },
  { id: "plastico_embalaje", nombre: "Plásticos de embalaje", icon: "📦" },
];

interface WasteRecord {
  id: string;
  type: string;
  category: string | null;
  weight: number;
  isHazardous: boolean;
  status: string;
  productionId: string | null;
  observations: string | null;
  createdAt: Date;
}

interface Props {
  initialData: WasteRecord[];
}

export default function WasteManagementClient({ initialData }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const totalWeight = initialData.reduce((acc, item) => acc + item.weight, 0);
  const managedWeight = initialData.filter(i => i.status === "gestionado").reduce((acc, i) => acc + i.weight, 0);
  const recyclingRate = totalWeight > 0 ? Math.round((managedWeight / totalWeight) * 100) : 0;
  const hazardousCount = initialData.filter(i => i.isHazardous).length;
  const accumulationWarning = totalWeight - managedWeight > 150;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createWasteRecordAction(formData);
      if (result.error) setError(result.error);
      else { setShowForm(false); router.refresh(); }
    } catch (err) { setError("Error al guardar"); }
    finally { setIsLoading(false); }
  };

  const handleManifestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await processWasteManifestAction(fd);
      if (res.error) alert(res.error);
      else alert(`Manifiesto validado: ${res.data.totalWeight}kg recolectados.`);
    } catch (err) { alert("Error en OCR"); }
    finally { setIsLoading(false); }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-stone-900">Gestión de Residuos Textiles</h1>
            <HelpModal 
              title="Guía de Gestión de Residuos"
              description="Aprende a transformar el desperdicio en indicadores de sostenibilidad y cumplimiento legal."
              steps={[
                { title: "Captura de Datos", detail: "Registra el peso y categoría de cada residuo. Asócialo a una Orden de Producción para medir la eficiencia por lote." },
                { title: "Alerta RESPEL", detail: "Si manejas aceites o químicos, marca la casilla RESPEL para generar las alertas legales obligatorias." },
                { title: "Validación OCR", detail: "Cuando el gestor recoja los residuos, sube una foto del manifiesto. Nuestra IA validará el peso automáticamente." },
                { title: "Simbiosis Industrial", detail: "Usa los indicadores para conectar con empresas que aprovechan tus retales como materia prima." }
              ]}
            />
          </div>
          <p className="text-stone-600">Control de generación, aprovechamiento y cumplimiento legal</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Registrar Generación
          </button>
        </div>
      </div>

      {/* Indicadores Principales */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Generado</p>
              <p className="text-3xl font-bold text-stone-900">{totalWeight.toFixed(1)} kg</p>
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full transition-all duration-1000" style={{ width: `${recyclingRate}%` }} />
            </div>
            <span className="text-sm font-bold text-green-700">{recyclingRate}% aprovechado</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Alertas RESPEL</p>
              <p className={`text-3xl font-bold ${hazardousCount > 0 ? "text-red-600" : "text-stone-900"}`}>{hazardousCount}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hazardousCount > 0 ? "bg-red-100" : "bg-stone-100"}`}>
              <svg className={`w-6 h-6 ${hazardousCount > 0 ? "text-red-600" : "text-stone-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <p className="text-xs text-stone-500 font-medium">Soportes: {initialData.filter(i => i.status === "gestionado").length} / {initialData.length} cargados</p>
        </div>

        <div className="bg-stone-900 text-white rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">Acciones Rápidas</h3>
            <p className="text-sm text-stone-300 mb-4">Genera reportes para autoridades ambientales (AMVA/Corantioquia)</p>
          </div>
          <button onClick={() => window.print()} className="w-full py-2 bg-white text-stone-900 font-bold rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
            Descargar Bitácora Ambiental
          </button>
        </div>
      </div>

      {/* Alerta de Acumulación */}
      {accumulationWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600 text-xl font-bold">!</div>
          <div>
            <p className="text-sm font-bold text-amber-900">Alerta de Acumulación Detectada</p>
            <p className="text-xs text-amber-700">Tienes {(totalWeight - managedWeight).toFixed(0)}kg sin salida gestionada. Se recomienda agendar recolección inmediata para evitar riesgos legales o de incendio.</p>
          </div>
        </div>
      )}

      {/* Formulario de Registro */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-8 mb-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-800">Registrar Generación de Residuo</h2>
            <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-3">Categoría del Material</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIAS.map(cat => (
                  <label key={cat.id} className="relative cursor-pointer group">
                    <input type="radio" name="type" value={cat.id} required className="peer sr-only" />
                    <div className="p-3 border border-stone-200 rounded-xl text-center peer-checked:border-green-600 peer-checked:bg-green-50 transition-all group-hover:border-stone-300">
                      <span className="text-xl block mb-1">{cat.icon}</span>
                      <span className="text-[10px] font-bold uppercase text-stone-500 group-hover:text-stone-700 leading-tight block">{cat.nombre}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Peso Neto (kg)</label>
                <input name="weight" type="number" step="0.01" required className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg font-bold focus:ring-2 focus:ring-green-500 outline-none" placeholder="0.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Orden de Producción (Opcional)</label>
                <input name="productionId" type="text" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="Lote #..." />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-800 uppercase">¿Es RESPEL?</span>
                  <input type="checkbox" name="isHazardous" value="true" className="w-5 h-5 accent-red-600" />
                </div>
                <p className="text-[10px] text-red-600 leading-tight">Marcar si contiene aceites o químicos.</p>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-50">
                {isLoading ? "Procesando..." : "Guardar Registro"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bitácora de Movimientos */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h2 className="text-lg font-bold text-stone-800">Bitácora de Movimientos y Salidas</h2>
          <div className="relative overflow-hidden">
             <input type="file" onChange={handleManifestUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             <button className="px-4 py-2 border border-green-600 text-green-700 font-bold text-xs rounded-lg hover:bg-green-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              Validar Acta (OCR)
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-stone-400 uppercase tracking-widest bg-stone-50/30">
                <th className="px-6 py-4">Fecha / Lote</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4 text-center">Peso</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {initialData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400 italic">No hay registros generados.</td></tr>
              ) : (
                initialData.map(item => (
                  <tr key={item.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-stone-800 text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-stone-400 uppercase">{item.productionId || "Sin lote"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {item.isHazardous && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="RESPEL" />}
                        <span className="font-medium text-stone-700 text-sm">
                          {CATEGORIAS.find(c => c.id === item.type)?.nombre || item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-stone-900">{item.weight} kg</td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={async () => {
                          const newStatus = item.status === "gestionado" ? "disponible" : "gestionado";
                          await updateWasteRecordAction(item.id, { status: newStatus });
                          router.refresh();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        item.status === "gestionado" ? "bg-green-600 border-green-600 text-white" : "bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300"
                      }`}>
                        {item.status === "gestionado" ? "Gestionado" : "Pendiente"}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={async () => { if(confirm("¿Eliminar?")) { await deleteWasteRecordAction(item.id); router.refresh(); } }} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
