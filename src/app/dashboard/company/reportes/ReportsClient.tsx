"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HelpModal from "@/features/environmental/components/HelpModal";

interface Props {
  company: {
    name: string;
    nit: string;
  };
}

export default function ReportsClient({ company }: Props) {
  const [period, setPeriod] = useState("current_month");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reportReady, setReportReady] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setReportReady(false);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          setReportReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const downloadPDF = () => {
    window.print();
    setReportReady(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-stone-900">Centro de Reportes y Auditoría</h1>
            <HelpModal 
              title="Guía de Reportes y Auditoría"
              description="Convierte tus datos operativos en documentos oficiales para autoridades y entidades financieras."
              steps={[
                { title: "Selección del Periodo", detail: "Elige el rango de tiempo que deseas auditar (mes, trimestre o año fiscal)." },
                { title: "Filtros de Datos", detail: "Marca las casillas para incluir evidencias específicas como fotos de facturas o certificados de recolección." },
                { title: "Generación del PDF", detail: "Haz clic en 'Generar' para que el sistema compile gráficas y textos de cumplimiento normativo." },
                { title: "Uso del Documento", detail: "Descarga el reporte para enviarlo por correo o presentarlo impreso ante inspectores del AMVA." }
              ]}
            />
          </div>
          <p className="text-stone-600">Genera documentos oficiales para autoridades ambientales y toma de decisiones</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Paso 1 y 2: Selección y Filtros */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm">1</span>
              Parámetros del Reporte
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">Tipo de Informe</label>
                <select className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none">
                  <option>Reporte de Cumplimiento Ambiental (Integral)</option>
                  <option>Certificado de Disposición de Residuos</option>
                  <option>Informe de Eficiencia Operativa (Costos/Prenda)</option>
                  <option>Bitácora PUEAA (Uso de Agua)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-2">Periodo de Auditoría</label>
                <select 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none"
                >
                  <option value="current_month">Mes Actual (Abril 2026)</option>
                  <option value="last_quarter">Último Trimestre</option>
                  <option value="last_semester">Último Semestre</option>
                  <option value="year">Año Fiscal 2025-2026</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-bold text-stone-600 mb-4">Información a Incluir (Filtros)</label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-600" />
                  <span className="text-sm text-stone-700 font-medium">Incluir evidencias de facturas (EPM)</span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-600" />
                  <span className="text-sm text-stone-700 font-medium">Incluir manifiestos de recolección</span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-green-600" />
                  <span className="text-sm text-stone-700 font-medium">Incluir certificados de siembra</span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-green-600" />
                  <span className="text-sm text-stone-700 font-medium">Análisis de eficiencia por prenda</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {!generating && !reportReady && (
              <button 
                onClick={handleGenerate}
                className="px-10 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Generar PDF de Auditoría
              </button>
            )}

            {generating && (
              <div className="w-full bg-stone-100 rounded-2xl p-6 border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-stone-700 animate-pulse italic">Compilando datos y evidencias ambientales...</p>
                  <span className="text-stone-900 font-black">{progress}%</span>
                </div>
                <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                  <div 
                    className="h-full bg-green-600 transition-all duration-300" 
                    style={{ 
                      width: `${progress}%`,
                      backgroundImage: "linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)",
                      backgroundSize: "1rem 1rem"
                    }} 
                  />
                </div>
              </div>
            )}

            {reportReady && (
              <div className="w-full flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-green-900">Tu reporte de sostenibilidad está listo</p>
                    <p className="text-xs text-green-700">Audit_Report_{company.name.replace(/\s/g, '_')}_2026.pdf</p>
                  </div>
                </div>
                <button 
                  onClick={downloadPDF}
                  className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Descargar Ahora
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lateral: Ayuda y Contexto */}
        <div className="space-y-6">
          <div className="bg-[#E5E2DC] p-8 rounded-2xl border border-stone-300">
            <h4 className="font-black text-stone-900 text-sm uppercase tracking-widest mb-4">Valor Administrativo</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-green-700">🛡️</span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed"><strong>Tranquilidad en Inspecciones:</strong> Presenta el reporte instantáneamente ante funcionarios del AMVA o Corantioquia.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-700">🏦</span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed"><strong>Créditos Verdes:</strong> Usa este documento como prueba de sostenibilidad para acceder a tasas preferenciales en bancos.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-700">⚡</span>
                <p className="text-xs text-stone-700 font-medium leading-relaxed"><strong>Ahorro Operativo:</strong> Elimina días de trabajo manual organizando recibos y fotos.</p>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-[10px] font-black text-stone-400 uppercase mb-4 tracking-tighter">Vista Previa de Estructura</p>
            <div className="border-2 border-stone-100 rounded-lg p-4 space-y-3 opacity-50 select-none">
              <div className="w-1/2 h-4 bg-stone-100 rounded" />
              <div className="w-full h-20 bg-stone-50 rounded border border-dashed border-stone-200" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-stone-100 rounded" />
                <div className="h-10 bg-stone-100 rounded" />
              </div>
              <div className="w-3/4 h-3 bg-stone-50 rounded" />
            </div>
            <p className="text-[10px] text-center text-stone-400 mt-4 italic">Cumple con Res. 0631 y Res. 1407</p>
          </div>
        </div>
      </div>

      {/* Visualización para Impresión (El PDF) */}
      <div className="hidden print:block bg-white p-10 font-serif" id="printable-report">
        <div className="flex justify-between items-start border-b-4 border-stone-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-stone-900 uppercase">{company.name}</h1>
            <p className="text-stone-500 font-bold tracking-widest uppercase">Reporte de Cumplimiento Ambiental</p>
            <p className="text-stone-400 text-sm mt-1">NIT: {company.nit}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-stone-500">FECHA DE EMISIÓN</p>
            <p className="text-lg font-bold text-stone-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div className="border-l-4 border-green-600 pl-6">
            <h3 className="text-xs font-black text-stone-400 uppercase mb-2">Resumen de Agua y Energía</h3>
            <p className="text-sm text-stone-700 leading-relaxed">Se registra un monitoreo constante de los parámetros de vertimientos según la <strong>Resolución 0631</strong>. Los consumos de energía se encuentran dentro de los rangos óptimos de eficiencia.</p>
          </div>
          <div className="border-l-4 border-[#8A9A5B] pl-6">
            <h3 className="text-xs font-black text-stone-400 uppercase mb-2">Gestión de Residuos</h3>
            <p className="text-sm text-stone-700 leading-relaxed">Certificación de aprovechamiento del 85% de los retales textiles mediante convenios de simbiosis industrial y gestores autorizados (Res. 1407).</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xs font-black text-stone-400 uppercase mb-6">Visualización de Tendencias</h3>
          <div className="grid grid-cols-3 gap-4 h-32 items-end">
            <div className="bg-stone-100 h-1/2" /><div className="bg-stone-200 h-3/4" /><div className="bg-stone-100 h-1/2" />
            <div className="bg-stone-200 h-full" /><div className="bg-stone-100 h-3/4" /><div className="bg-stone-200 h-full" />
          </div>
        </div>

        <div className="pt-20 border-t border-stone-200 flex justify-between items-end">
          <div>
            <div className="w-48 h-1 bg-stone-900 mb-4" />
            <p className="text-xs font-bold text-stone-900">FIRMA RESPONSABLE AMBIENTAL</p>
            <p className="text-[10px] text-stone-400">Generado automáticamente por Plataforma EcoGestión PyME</p>
          </div>
          <div className="bg-stone-900 text-white p-4 text-[10px] font-bold tracking-widest uppercase">
            Documento de Auditoría Interna
          </div>
        </div>
      </div>
    </main>
  );
}
