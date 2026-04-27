"use server";

import { deleteCompanyAction, toggleCompanyStatusAction } from "@/features/company/actions";
import { revalidatePath } from "next/cache";

export async function handleBloquear(formData: FormData) {
  const id = formData.get("id") as string;
  await toggleCompanyStatusAction(id);
  revalidatePath("/dashboard/platform/empresas");
}

export async function handleEliminar(formData: FormData) {
  const id = formData.get("id") as string;
  await deleteCompanyAction(id);
  revalidatePath("/dashboard/platform/empresas");
}