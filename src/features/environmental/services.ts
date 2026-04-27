import prisma from "@/shared/lib/prisma";
import { randomUUID } from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processBillOCR(fileBuffer: Buffer, mimeType: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no configurada");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analiza esta factura de servicios públicos (EPM/UNE/otros) y extrae los siguientes datos en formato JSON:
      {
        "waterAmount": número (m3 consumidos),
        "waterDischargeCost": número (costo por vertimientos/alcantarillado),
        "energyAmount": número (kWh consumidos),
        "energyReactiveCost": número (cobro por energía reactiva),
        "period": "YYYY-MM" (año y mes de la factura),
        "observations": "breve resumen del análisis detectando posibles multas o cobros inusuales"
      }
      Si no encuentras alguno de los datos, pon 0. Responde SOLO el JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("OCR Error:", error);
    throw error;
  }
}

export async function getEnvironmentalStats(companyId: string) {
  try {
    const currentPeriod = new Date().toISOString().slice(0, 7);
    const lastPeriod = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);

    const [waterCurrent, waterLast, energyCurrent, energyLast, wasteTotal, alerts, production, wasteRecords] = await Promise.all([
      prisma.waterConsumption.findFirst({ where: { companyId, period: currentPeriod } }),
      prisma.waterConsumption.findFirst({ where: { companyId, period: lastPeriod } }),
      prisma.energyConsumption.findFirst({ where: { companyId, period: currentPeriod } }),
      prisma.energyConsumption.findFirst({ where: { companyId, period: lastPeriod } }),
      prisma.wasteRecord.aggregate({ where: { companyId }, _sum: { weight: true } }),
      prisma.alert.count({ where: { companyId, read: false } }),
      prisma.productionRecord.findFirst({ where: { companyId, period: currentPeriod } }),
      prisma.wasteRecord.findMany({ where: { companyId } }),
    ]);

    const waterChange = waterLast?.amount
      ? Math.round(((waterCurrent?.amount || 0) - waterLast.amount) / waterLast.amount * 100)
      : 0;

    const energyChange = energyLast?.amount
      ? Math.round(((energyCurrent?.amount || 0) - energyLast.amount) / energyLast.amount * 100)
      : 0;

    // Indicador de impacto por prenda
    const itemsCount = production?.itemsCount || 0;
    const waterImpact = itemsCount > 0 ? (waterCurrent?.amount || 0) / itemsCount : 0;
    const energyImpact = itemsCount > 0 ? (energyCurrent?.amount || 0) / itemsCount : 0;

    // Residuos: % Aprovechamiento (disponible vs gestionado)
    // Supongamos que 'gestionado' es aprovechado
    const totalWeight = wasteTotal._sum.weight || 0;
    const managedWeight = wasteRecords
      .filter(r => r.status === "gestionado")
      .reduce((acc, r) => acc + r.weight, 0);
    const recyclingRate = totalWeight > 0 ? Math.round((managedWeight / totalWeight) * 100) : 0;

    return {
      water: {
        current: waterCurrent?.amount || 0,
        change: waterChange,
        dischargeCost: waterCurrent?.dischargeCost || 0,
        impactPerItem: waterImpact,
      },
      energy: {
        current: energyCurrent?.amount || 0,
        change: energyChange,
        reactiveCost: energyCurrent?.reactiveEnergyCost || 0,
        impactPerItem: energyImpact,
      },
      waste: {
        total: totalWeight,
        recyclingRate,
        hazardousCount: wasteRecords.filter(r => r.isHazardous).length,
      },
      production: {
        itemsCount,
      },
      alerts: alerts || 0,
    };
  } catch (error) {
    console.error("Error fetching environmental stats:", error);
    return {
      water: { current: 0, change: 0, dischargeCost: 0, impactPerItem: 0 },
      energy: { current: 0, change: 0, reactiveCost: 0, impactPerItem: 0 },
      waste: { total: 0, recyclingRate: 0, hazardousCount: 0 },
      production: { itemsCount: 0 },
      alerts: 0,
    };
  }
}

export async function createWaterConsumption(data: { 
  companyId: string; 
  amount: number; 
  dischargeCost?: number; 
  period: string; 
  observations?: string 
}) {
  const record = await prisma.waterConsumption.create({
    data: {
      id: randomUUID(),
      ...data,
    },
  });
  return record;
}

export async function createEnergyConsumption(data: { 
  companyId: string; 
  amount: number; 
  reactiveEnergyCost?: number; 
  period: string; 
  observations?: string 
}) {
  const record = await prisma.energyConsumption.create({
    data: {
      id: randomUUID(),
      ...data,
    },
  });

  if ((data.reactiveEnergyCost || 0) > 0) {
    await createAlert({
      companyId: data.companyId,
      type: "energy",
      message: `Se ha detectado un cobro de $${data.reactiveEnergyCost} por energía reactiva. Se recomienda revisar motores y banco de condensadores.`,
      level: "warning"
    });
  }

  return record;
}

export async function createProductionRecord(data: { companyId: string; itemsCount: number; period: string }) {
  const existing = await prisma.productionRecord.findFirst({
    where: { companyId: data.companyId, period: data.period }
  });

  if (existing) {
    return await prisma.productionRecord.update({
      where: { id: existing.id },
      data: { itemsCount: data.itemsCount }
    });
  }

  return await prisma.productionRecord.create({
    data: {
      id: randomUUID(),
      ...data
    }
  });
}

export async function getConsumptionHistory(companyId: string) {
  try {
    const [water, energy, production] = await Promise.all([
      prisma.waterConsumption.findMany({ where: { companyId }, orderBy: { period: "desc" } }),
      prisma.energyConsumption.findMany({ where: { companyId }, orderBy: { period: "desc" } }),
      prisma.productionRecord.findMany({ where: { companyId }, orderBy: { period: "desc" } }),
    ]);

    const periods = Array.from(new Set([
      ...water.map((w) => w.period), 
      ...energy.map((e) => e.period),
      ...production.map((p) => p.period)
    ]))
      .sort()
      .reverse();

    return periods.slice(0, 12).map((p) => ({
      period: p,
      water: water.find((w) => w.period === p) || null,
      energy: energy.find((e) => e.period === p) || null,
      production: production.find((pr) => pr.period === p) || null,
    }));
  } catch (error) {
    console.error("Error fetching consumption history:", error);
    return [];
  }
}

export async function getWaterConsumption(companyId: string, period?: string) {
  const where: { companyId: string; period?: string } = { companyId };
  if (period) where.period = period;
  return await prisma.waterConsumption.findMany({ where, orderBy: { period: "desc" } });
}

export async function getEnergyConsumption(companyId: string, period?: string) {
  const where: { companyId: string; period?: string } = { companyId };
  if (period) where.period = period;
  return await prisma.energyConsumption.findMany({ where, orderBy: { period: "desc" } });
}

export async function getWasteRecords(companyId: string) {
  return await prisma.wasteRecord.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
}

export async function getComplianceRecords(companyId: string) {
  return await prisma.complianceRecord.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });
}

export async function getAlerts(companyId: string, unreadOnly = false) {
  return await prisma.alert.findMany({
    where: { companyId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAlert(data: { companyId: string; type: string; message: string; level?: string }) {
  return await prisma.alert.create({
    data: {
      id: randomUUID(),
      ...data,
      level: data.level || "info",
      read: false,
    },
  });
}

export async function markAlertAsRead(id: string) {
  return await prisma.alert.update({ where: { id }, data: { read: true } });
}

export async function createWasteRecord(data: { 
  companyId: string; 
  type: string; 
  category?: string;
  weight: number; 
  isHazardous?: boolean;
  status?: string; 
  productionId?: string;
  observations?: string 
}) {
  return await prisma.wasteRecord.create({
    data: { 
      id: randomUUID(), 
      ...data, 
      status: data.status || "disponible" 
    }
  });
}

export async function deleteWasteRecord(id: string) {
  return await prisma.wasteRecord.delete({ where: { id } });
}

export async function updateWasteRecord(id: string, data: any) {
  return await prisma.wasteRecord.update({ where: { id }, data });
}

export async function processWasteManifestOCR(fileBuffer: Buffer, mimeType: string) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY no configurada");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
      Analiza este MANIFIESTO DE CARGA o ACTA DE RECOLECCIÓN de residuos.
      Extrae el peso total recolectado en kg.
      Responde SOLO un JSON: { "totalWeight": número }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: fileBuffer.toString("base64"), mimeType } },
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("OCR Manifest Error:", error);
    throw error;
  }
}

export async function createComplianceRecord(data: { companyId: string; norm: string; status: string; percentage: number; observations?: string }) {
  return await prisma.complianceRecord.create({ data: { id: randomUUID(), ...data } });
}

export async function updateComplianceRecord(id: string, data: { status?: string; percentage?: number; observations?: string }) {
  return await prisma.complianceRecord.update({ where: { id }, data });
}

export async function deleteWaterConsumption(id: string) { return await prisma.waterConsumption.delete({ where: { id } }); }
export async function deleteEnergyConsumption(id: string) { return await prisma.energyConsumption.delete({ where: { id } }); }
export async function updateWaterConsumption(id: string, data: { amount: number; dischargeCost?: number; period: string; observations?: string }) { 
  return await prisma.waterConsumption.update({ where: { id }, data }); 
}
export async function updateEnergyConsumption(id: string, data: { amount: number; reactiveEnergyCost?: number; period: string; observations?: string }) { 
  return await prisma.energyConsumption.update({ where: { id }, data }); 
}

export async function getCompanyByUserId(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId }, include: { adminCompanies: true } });
  return user?.adminCompanies[0] || null;
}
