"use server";

import { redirect } from "next/navigation";
import {
  getWaterConsumption,
  getEnergyConsumption,
  getWasteRecords,
  getComplianceRecords,
  getAlerts,
  getEnvironmentalStats,
  getCompanyByUserId,
  getConsumptionHistory,
  createWaterConsumption,
  createEnergyConsumption,
  createWasteRecord,
  createAlert,
  markAlertAsRead,
  deleteWasteRecord,
  updateWasteRecord,
  createComplianceRecord,
  updateComplianceRecord,
  processBillOCR,
  processWasteManifestOCR,
  deleteWaterConsumption as deleteWaterSvc,
  deleteEnergyConsumption as deleteEnergySvc,
  updateWaterConsumption as updateWaterSvc,
  updateEnergyConsumption as updateEnergySvc,
  createProductionRecord,
} from "./services";
import { getSession } from "@/features/auth/services";

export {
  getWaterConsumption,
  getEnergyConsumption,
  getWasteRecords,
  getComplianceRecords,
  getAlerts,
  getEnvironmentalStats,
  getCompanyByUserId,
  getConsumptionHistory,
};

export async function createWaterConsumptionAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "No autenticado" };
  const company = await getCompanyByUserId((session.user as { id: string }).id);
  if (!company) return { error: "No tienes una empresa asignada" };

  const amount = parseFloat(formData.get("amount") as string);
  const dischargeCost = parseFloat(formData.get("dischargeCost") as string || "0");
  const period = formData.get("period") as string;
  const observations = formData.get("observations") as string;

  if (isNaN(amount) || !period) return { error: "Monto y período son requeridos" };

  try {
    await createWaterConsumption({ companyId: company.id, amount, dischargeCost, period, observations });
    return { success: true };
  } catch (error) { return { error: "Error al crear el registro" }; }
}

export async function createEnergyConsumptionAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "No autenticado" };
  const company = await getCompanyByUserId((session.user as { id: string }).id);
  if (!company) return { error: "No tienes una empresa asignada" };

  const amount = parseFloat(formData.get("amount") as string);
  const reactiveEnergyCost = parseFloat(formData.get("reactiveEnergyCost") as string || "0");
  const period = formData.get("period") as string;
  const observations = formData.get("observations") as string;

  if (isNaN(amount) || !period) return { error: "Monto y período son requeridos" };

  try {
    await createEnergyConsumption({ companyId: company.id, amount, reactiveEnergyCost, period, observations });
    return { success: true };
  } catch (error) { return { error: "Error al crear el registro" }; }
}

export async function createProductionRecordAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "No autenticado" };
  const company = await getCompanyByUserId((session.user as { id: string }).id);
  if (!company) return { error: "No tienes una empresa asignada" };

  const itemsCount = parseInt(formData.get("itemsCount") as string, 10);
  const period = formData.get("period") as string;

  if (isNaN(itemsCount) || !period) return { error: "Cantidad y periodo son requeridos" };

  try {
    await createProductionRecord({ companyId: company.id, itemsCount, period });
    return { success: true };
  } catch (error) { return { error: "Error al registrar producción" }; }
}

export async function createWasteRecordAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "No autenticado" };
  const company = await getCompanyByUserId((session.user as { id: string }).id);
  if (!company) return { error: "No tienes una empresa asignada" };

  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const weight = parseFloat(formData.get("weight") as string);
  const isHazardous = formData.get("isHazardous") === "true";
  const productionId = formData.get("productionId") as string;
  const observations = formData.get("observations") as string;

  if (!type || isNaN(weight)) return { error: "Tipo y peso son requeridos" };

  try {
    await createWasteRecord({ companyId: company.id, type, category, weight, isHazardous, productionId, observations });
    return { success: true };
  } catch (error) { return { error: "Error al crear el registro" }; }
}

export async function updateWasteRecordAction(id: string, data: any) {
  try {
    await updateWasteRecord(id, data);
    return { success: true };
  } catch (error) { return { error: "Error al actualizar" }; }
}

export async function processWasteManifestAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "Archivo no encontrado" };
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await processWasteManifestOCR(buffer, file.type);
    return { success: true, data: result };
  } catch (error) { return { error: "Error en OCR: " + (error as Error).message }; }
}

export async function processBillAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "Archivo no encontrado" };
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ocrResult = await processBillOCR(buffer, file.type);
    return { success: true, data: ocrResult };
  } catch (error) { return { error: "Error en OCR: " + (error as Error).message }; }
}

export async function deleteWasteRecordAction(id: string) {
  try {
    await deleteWasteRecord(id);
    return { success: true };
  } catch (error) { return { error: "Error al eliminar" }; }
}

export async function deleteWaterConsumptionAction(id: string) {
  try { await deleteWaterSvc(id); return { success: true }; } catch (error) { return { error: (error as Error).message }; }
}

export async function deleteEnergyConsumptionAction(id: string) {
  try { await deleteEnergySvc(id); return { success: true }; } catch (error) { return { error: (error as Error).message }; }
}

export async function updateWaterConsumptionAction(id: string, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const dischargeCost = parseFloat(formData.get("dischargeCost") as string || "0");
  const period = formData.get("period") as string;
  const observations = formData.get("observations") as string;
  try { await updateWaterSvc(id, { amount, dischargeCost, period, observations }); return { success: true }; } catch (error) { return { error: (error as Error).message }; }
}

export async function updateEnergyConsumptionAction(id: string, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const reactiveEnergyCost = parseFloat(formData.get("reactiveEnergyCost") as string || "0");
  const period = formData.get("period") as string;
  const observations = formData.get("observations") as string;
  try { await updateEnergySvc(id, { amount, reactiveEnergyCost, period, observations }); return { success: true }; } catch (error) { return { error: (error as Error).message }; }
}

export async function markAlertAsReadAction(id: string) {
  try { await markAlertAsRead(id); return { success: true }; } catch (error) { return { error: "Error al marcar" }; }
}

export async function createComplianceRecordAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) return { error: "No autenticado" };
  const company = await getCompanyByUserId((session.user as { id: string }).id);
  const norm = formData.get("norm") as string;
  const status = formData.get("status") as string;
  const percentage = parseInt(formData.get("percentage") as string, 10);
  const observations = formData.get("observations") as string;
  try { await createComplianceRecord({ companyId: company!.id, norm, status, percentage, observations }); return { success: true }; } catch (error) { return { error: "Error" }; }
}

export async function updateComplianceRecordAction(id: string, formData: FormData) {
  const status = formData.get("status") as string;
  const percentage = parseInt(formData.get("percentage") as string, 10);
  const observations = formData.get("observations") as string;
  try { await updateComplianceRecord(id, { status, percentage, observations }); return { success: true }; } catch (error) { return { error: "Error" }; }
}
