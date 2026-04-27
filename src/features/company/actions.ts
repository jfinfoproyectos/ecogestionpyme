"use server";

import { redirect } from "next/navigation";
import prisma from "@/shared/lib/prisma";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { auth } from "@/features/auth/lib/auth";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id || null;
}

export async function createCompanyAction(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const direccion = formData.get("direccion") as string;
  const telefono = formData.get("telefono") as string;
  const adminNombre = formData.get("adminNombre") as string;
  const adminEmail = formData.get("adminEmail") as string;
  const adminPassword = formData.get("adminPassword") as string;

  if (!nombre || !nit || !adminNombre || !adminEmail || !adminPassword) {
    return { error: "Todos los campos marcados con * son requeridos" };
  }

  if (adminPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("DEBUG: Current session user:", session?.user);
    
    if (!session?.user) {
      return { error: "Debes iniciar sesión para crear una empresa" };
    }

    const creatorId = session.user.id;

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return { error: "Ya existe un usuario con este correo electrónico" };
    }

    const companyId = generateId();
    const company = await prisma.company.create({
      data: {
        id: companyId,
        name: nombre,
        nit,
        address: direccion || null,
        phone: telefono || null,
        active: true,
        creatorId,
      },
    });

    const adminUserId = generateId();

    try {
      await auth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminNombre,
        },
      });

      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "COMPANY_ADMIN",
          adminCompanies: {
            connect: { id: company.id },
          },
        },
      });

      const verifyUser = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: { accounts: true },
      });

      if (!verifyUser || verifyUser.accounts.length === 0) {
        await prisma.company.delete({ where: { id: company.id } });
        await prisma.user.delete({ where: { email: adminEmail } }).catch(() => {});
        return { error: "Error: la cuenta de usuario no se creó correctamente" };
      }

      return { success: true };
    } catch (userError) {
      await prisma.company.delete({ where: { id: company.id } }).catch(() => {});
      console.error("Error creating user:", userError);
      const errorMsg = userError instanceof Error ? userError.message : JSON.stringify(userError);
      return { error: "Error al crear el usuario administrador: " + errorMsg };
    }
  } catch (error) {
    console.error("Create company error:", error);
    const err = error as Error & { code?: string };
    if (err.code === "P2002") {
      return { error: "Ya existe un usuario con este correo electrónico" };
    }
    if ((error as { message?: string }).message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Error al crear la empresa: " + (error as Error).message };
  }
}

export async function updateCompanyAction(formData: FormData) {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const direccion = formData.get("direccion") as string;
  const telefono = formData.get("telefono") as string;
  const estado = formData.get("estado") as string;

  if (!id || !nombre || !nit) {
    return { error: "Datos requeridos faltantes" };
  }

  try {
    await prisma.company.update({
      where: { id },
      data: {
        name: nombre,
        nit,
        address: direccion || null,
        phone: telefono || null,
        active: estado === "activa",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update company error:", error);
    return { error: "Error al actualizar la empresa" };
  }
}

export async function deleteCompanyAction(id: string) {
  if (!id) {
    return { error: "ID de empresa requerido" };
  }

  try {
    await prisma.company.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete company error:", error);
    return { error: "Error al eliminar la empresa" };
  }
}

export async function toggleCompanyStatusAction(id: string) {
  if (!id) {
    return { error: "ID de empresa requerido" };
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return { error: "Empresa no encontrada" };
    }

    await prisma.company.update({
      where: { id },
      data: {
        active: !company.active,
      },
    });

    return { success: true, active: !company.active };
  } catch (error) {
    console.error("Toggle company status error:", error);
    return { error: "Error al cambiar el estado de la empresa" };
  }
}
export async function updateCompanyActivitiesAction(id: string, activities: string[]) {
  if (!id) return { error: 'ID de empresa requerido' };
  try {
    await prisma.company.update({
      where: { id },
      data: { activities },
    });
    return { success: true };
  } catch (error) {
    console.error('Update company activities error:', error);
    return { error: 'Error al actualizar las actividades' };
  }
}
