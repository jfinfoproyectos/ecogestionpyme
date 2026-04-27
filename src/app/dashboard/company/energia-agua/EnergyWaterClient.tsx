"use client";

import { useState } from "react";
import { 
  createWaterConsumptionAction, 
  createEnergyConsumptionAction, 
  processBillAction,
  deleteWaterConsumptionAction,
  deleteEnergyConsumptionAction,
  updateWaterConsumptionAction,
  updateEnergyConsumptionAction,
  createProductionRecordAction
} from "@/features/environmental/actions";
import { useRouter } from "next/navigation";
import HelpModal from "@/features/environmental/components/HelpModal";

interface BillRecord {
  period: string;
  water: any;
  energy: any;
  production: any;
}

interface Props {
  stats: {
    water: { current: number; change: number; dischargeCost: number; impactPerItem: number };
    energy: { current: number; change: number; reactiveCost: number; impactPerItem: number };
    production: { itemsCount: number };
  };
  history: BillRecord[];
}

export default function EnergyWaterClient({ stats, history }: Props) {
  const [uploading, setUploading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [ocrData, setOcrData] = useState<{ 
    waterAmount: number; 
    waterDischargeCost: number; 
    energyAmount: number; 
    energyReactiveCost: number; 
    period: string; 
    observations: string 
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"water" | "energy" | "production">("water");
  const [editingPeriod, setEditingPeriod] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await processBillAction(formData);
      
      if (result.error) {
        alert(result.error);
      } else {
        setOcrData(result.data);
        setShowManualForm(false);
      }
    } catch (err) {
      alert("Error al procesar la factura.");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const period = formData.get("period") as string;
    
    try {
      if (ocrData || editingPeriod) {
        const waterVal = formData.get("waterAmount") as string;
        const waterCost = formData.get("waterDischargeCost") as string;
        const energyVal = formData.get("energyAmount") as string;
        const energyCost = formData.get("energyReactiveCost") as string;
        
        const promises = [];
        
        if (waterVal) {
          const waterFD = new FormData();
          waterFD.append("amount", waterVal);
          waterFD.append("dischargeCost", waterCost || "0");
          waterFD.append("period", period);
          waterFD.append("observations", formData.get("observations") as string);
          
          const existingWater = history.find(h => h.period === period)?.water;
          if (existingWater) {
            promises.push(updateWaterConsumptionAction(existingWater.id, waterFD));
          } else {
            promises.push(createWaterConsumptionAction(waterFD));
          }
        }
        
        if (energyVal) {
          const energyFD = new FormData();
          energyFD.append("amount", energyVal);
          energyFD.append("reactiveEnergyCost", energyCost || "0");
          energyFD.append("period", period);
          energyFD.append("observations", formData.get("observations") as string);
          
          const existingEnergy = history.find(h => h.period === period)?.energy;
          if (existingEnergy) {
            promises.push(updateEnergyConsumptionAction(existingEnergy.id, energyFD));
          } else {
            promises.push(createEnergyConsumptionAction(energyFD));
          }
        }

        await Promise.all(promises);
        setOcrData(null);
        setEditingPeriod(null);
      } else if (activeTab === "production") {
        await createProductionRecordAction(formData);
      } else {
        if (activeTab === "water") {
          await createWaterConsumptionAction(formData);
        } else {
          await createEnergyConsumptionAction(formData);
        }
      }
      setShowManualForm(false);
      setShowProductionForm(false);
      router.refresh();
      alert("Datos guardados correctamente.");
    } catch (err) {
      alert("Error al guardar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBill = async (record: BillRecord) => {
    if (!confirm(`¿Estás seguro de eliminar el registro completo del periodo ${record.period}?`)) return;
    try {
      const promises = [];
      if (record.water) promises.push(deleteWaterConsumptionAction(record.water.id));
      if (record.energy) promises.push(deleteEnergyConsumptionAction(record.energy.id));
      await Promise.all(promises);
      router.refresh();
    } catch (err) { alert("Error al eliminar."); }
  };

  const sortedHistory = [...history].sort((a, b) => a.period.localeCompare(b.period));
  const historyWater = sortedHistory.map(h => h.water).filter(Boolean);
  const historyEnergy = sortedHistory.map(h => h.energy).filter(Boolean);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-stone-900">Consultor de Eficiencia</h1>
            <HelpModal 
              title="Guía de Eficiencia Energética y Agua"
              description="Optimiza tus consumos y evita multas mediante el análisis inteligente de tus facturas."
              steps={[
                { title: "Carga de Factura (OCR)", detail: "Sube una foto de tu factura de EPM. Nuestra IA extraerá el consumo, costo de vertimientos y energía reactiva automáticamente." },
                { title: "Producción Mensual", detail: "Registra cuántas prendas produjiste en el mes. Esto nos permite calcular tu indicador de 'Impacto por Prenda'." },
                { title: "Energía Reactiva", detail: "Si detectamos cobros por energía reactiva, recibirás una alerta para revisar tus motores y evitar sanciones." },
                { title: "Análisis de Tendencias", detail: "Usa las gráficas para detectar ineficiencias. Si el consumo por prenda sube, es momento de revisar fugas o maquinaria." }
              ]}
            />
          </div>
          <p className="text-stone-600">Monitoreo automático de consumos, ineficiencias y cumplimiento legal</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setOcrData(null); setEditingPeriod(null); setShowProductionForm(true); setShowManualForm(false); setActiveTab("production"); }}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Registrar Producción
          </button>
          <button
            onClick={() => { setOcrData(null); setEditingPeriod(null); setShowManualForm(!showManualForm); setShowProductionForm(false); setActiveTab("water"); }}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Registro Manual
          </button>
        </div>
      </div>

      {/* Formulario de Verificación OCR o Edición Conjunta */}
      {(ocrData || editingPeriod) && (
        <div className="bg-blue-50 rounded-xl shadow-md border-2 border-blue-200 p-6 mb-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {editingPeriod ? `Editando factura del periodo ${editingPeriod}` : "Verifica los datos extraídos por AI"}
            </h2>
            <button onClick={() => { setOcrData(null); setEditingPeriod(null); }} className="text-blue-500 hover:text-blue-700 font-bold">✕ Cerrar</button>
          </div>
          
          <form onSubmit={handleManualSubmit} className="grid md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Agua (m³)</label>
              <input name="waterAmount" type="number" step="0.01" defaultValue={ocrData?.waterAmount || history.find(h => h.period === editingPeriod)?.water?.amount || ""} className="w-full px-2 py-1 border rounded" />
              <label className="block text-[10px] text-stone-500 mt-1">Costo Vertimiento ($)</label>
              <input name="waterDischargeCost" type="number" step="0.01" defaultValue={ocrData?.waterDischargeCost || history.find(h => h.period === editingPeriod)?.water?.dischargeCost || ""} className="w-full px-2 py-1 border rounded text-xs" />
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Energía (kWh)</label>
              <input name="energyAmount" type="number" step="0.01" defaultValue={ocrData?.energyAmount || history.find(h => h.period === editingPeriod)?.energy?.amount || ""} className="w-full px-2 py-1 border rounded" />
              <label className="block text-[10px] text-stone-500 mt-1">Energía Reactiva ($)</label>
              <input name="energyReactiveCost" type="number" step="0.01" defaultValue={ocrData?.energyReactiveCost || history.find(h => h.period === editingPeriod)?.energy?.reactiveEnergyCost || ""} className="w-full px-2 py-1 border rounded text-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Periodo</label>
              <input name="period" type="month" readOnly={!!editingPeriod} defaultValue={ocrData?.period || editingPeriod || ""} className="w-full px-4 py-2 border rounded-lg bg-blue-50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue-700 mb-1">Nota del Consultor AI</label>
              <textarea name="observations" defaultValue={ocrData?.observations || ""} rows={3} className="w-full px-4 py-2 border rounded-lg text-sm" />
            </div>
            <div className="md:col-span-5 flex justify-end gap-3">
              <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg disabled:opacity-50">
                {isLoading ? "Guardando..." : "Confirmar y Actualizar Factura"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario Manual / Producción */}
      {(showManualForm || showProductionForm) && !editingPeriod && !ocrData && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-4 mb-6 border-b border-stone-100 pb-2">
            <button onClick={() => setActiveTab("water")} className={`pb-2 px-4 font-medium transition-colors ${activeTab === "water" ? "text-blue-600 border-b-2 border-blue-600" : "text-stone-500"}`}>Agua</button>
            <button onClick={() => setActiveTab("energy")} className={`pb-2 px-4 font-medium transition-colors ${activeTab === "energy" ? "text-yellow-600 border-b-2 border-yellow-600" : "text-stone-500"}`}>Energía</button>
            <button onClick={() => setActiveTab("production")} className={`pb-2 px-4 font-medium transition-colors ${activeTab === "production" ? "text-purple-600 border-b-2 border-purple-600" : "text-stone-500"}`}>Producción (Prendas)</button>
          </div>

          <form onSubmit={handleManualSubmit} className="grid md:grid-cols-3 gap-4">
            {activeTab === "production" ? (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Cantidad de Prendas Producidas</label>
                <input name="itemsCount" type="number" required className="w-full px-4 py-2 border rounded-lg" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{activeTab === "water" ? "Cantidad (m³)" : "Cantidad (kWh)"}</label>
                <input name="amount" type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Periodo (Mes)</label>
              <input name="period" type="month" required defaultValue={new Date().toISOString().slice(0, 7)} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            {activeTab !== "production" && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Observaciones</label>
                <input name="observations" type="text" placeholder="Ej: Factura marzo" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            )}
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => { setShowManualForm(false); setShowProductionForm(false); }} className="text-stone-500 font-medium">Cancelar</button>
              <button type="submit" disabled={isLoading} className="px-6 py-2 bg-stone-900 text-white font-medium rounded-lg disabled:opacity-50">
                {isLoading ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Carga Automatizada OCR */}
      {!showManualForm && !showProductionForm && !ocrData && !editingPeriod && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Cargar Factura (Análisis OCR)</h2>
          <p className="text-stone-600 mb-6">Sube tu factura para extraer automáticamente consumos, cargos por vertimientos y multas por energía reactiva.</p>

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-12 text-center hover:border-green-500 transition-colors relative">
            <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="file-upload" disabled={uploading} />
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {uploading ? <p className="text-green-600 font-medium animate-pulse">Consultor AI analizando factura...</p> : <p className="text-stone-700 font-medium mb-2">Arrastra tu factura aquí o haz clic para subir</p>}
          </div>
        </div>
      )}

      {/* Indicadores de Eficiencia (Impacto por Prenda) */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-purple-900 text-white rounded-xl p-6 shadow-lg border-l-4 border-purple-400">
          <p className="text-purple-200 text-sm font-bold uppercase mb-2 tracking-widest">Producción Mensual</p>
          <p className="text-4xl font-black mb-1">{stats.production.itemsCount.toLocaleString()} <span className="text-xl font-normal">Prendas</span></p>
          <p className="text-xs text-purple-300">Meta: 2,500 prendas/mes</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-xs font-bold uppercase mb-1">Impacto Energía</p>
              <p className="text-2xl font-black text-stone-900">{stats.energy.impactPerItem.toFixed(3)} <span className="text-sm font-normal">kWh/prenda</span></p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold ${stats.energy.impactPerItem > 0.3 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {stats.energy.impactPerItem > 0.3 ? "Alta Ineficiencia" : "Eficiente"}
            </div>
          </div>
          {stats.energy.reactiveCost > 0 && (
            <div className="bg-red-50 p-2 rounded text-[10px] text-red-800 border border-red-100 font-medium">
              ⚠️ Multa por Energía Reactiva detectada: ${stats.energy.reactiveCost}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-stone-500 text-xs font-bold uppercase mb-1">Impacto Agua</p>
              <p className="text-2xl font-black text-stone-900">{stats.water.impactPerItem.toFixed(3)} <span className="text-sm font-normal">m³/prenda</span></p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold ${stats.water.impactPerItem > 0.05 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
              {stats.water.impactPerItem > 0.05 ? "Revisar Fugas" : "Óptimo"}
            </div>
          </div>
          <p className="text-[10px] text-stone-400">Cargo por vertimientos: ${stats.water.dischargeCost} (Base legal PUEAA)</p>
        </div>
      </div>

      {/* Gráficas de Tendencia */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-bold text-stone-800 mb-4 flex justify-between">Tendencia de Energía (kWh) <span className="text-xs text-stone-400">Últimos 6 meses</span></h3>
          <div className="flex items-end gap-2 h-32">
            {historyEnergy.slice(-6).map((item, i) => (
              <div key={i} className="flex-1 group relative">
                <div className="bg-yellow-400 rounded-t group-hover:bg-yellow-500 transition-colors" style={{ height: `${(item.amount / (Math.max(...historyEnergy.map(h => h.amount)) || 1)) * 100}%` }} />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 whitespace-nowrap">{item.period.split('-')[1]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h3 className="font-bold text-stone-800 mb-4 flex justify-between">Tendencia de Agua (m³) <span className="text-xs text-stone-400">Base para reporte AMVA</span></h3>
          <div className="flex items-end gap-2 h-32">
            {historyWater.slice(-6).map((item, i) => (
              <div key={i} className="flex-1 group relative">
                <div className="bg-blue-400 rounded-t group-hover:bg-blue-500 transition-colors" style={{ height: `${(item.amount / (Math.max(...historyWater.map(h => h.amount)) || 1)) * 100}%` }} />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 whitespace-nowrap">{item.period.split('-')[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listado de Facturas Unificadas */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-stone-800">Histórico de Auditoría Ambiental</h2>
          <button onClick={() => window.print()} className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium hover:bg-stone-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Exportar para PUEAA
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 text-xs font-black text-stone-400 uppercase tracking-tighter">
                <th className="px-4 py-3">Mes</th>
                <th className="px-4 py-3">Producción</th>
                <th className="px-4 py-3">Agua / Costo V.</th>
                <th className="px-4 py-3">Energía / Reactiva</th>
                <th className="px-4 py-3">Eficiencia</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {history.map((record) => (
                <tr key={record.period} className="hover:bg-stone-50 group transition-colors">
                  <td className="px-4 py-4 font-bold text-stone-900">{record.period}</td>
                  <td className="px-4 py-4 text-purple-700 font-bold">{record.production?.itemsCount || "-"} <span className="text-[10px] font-normal text-stone-400">prendas</span></td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-blue-700">{record.water?.amount || 0} m³</p>
                    <p className="text-[10px] text-stone-400">${record.water?.dischargeCost || 0} vert.</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-yellow-700">{record.energy?.amount || 0} kWh</p>
                    <p className={`text-[10px] ${(record.energy?.reactiveEnergyCost || 0) > 0 ? "text-red-500 font-bold" : "text-stone-400"}`}>${record.energy?.reactiveEnergyCost || 0} react.</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-medium text-stone-600">{( (record.energy?.amount || 0) / (record.production?.itemsCount || 1) ).toFixed(2)} kWh/p</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingPeriod(record.period); setOcrData(null); setShowManualForm(false); }} className="p-2 text-stone-400 hover:text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDeleteBill(record)} className="p-2 text-stone-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
