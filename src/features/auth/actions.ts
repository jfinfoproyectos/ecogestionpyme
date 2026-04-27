"use server";

import { redirect } from "next/navigation";
import prisma from "@/shared/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { auth } from "./lib/auth";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function generateId(): string {
  return randomBytes(16).toString("hex");
}

// Las acciones de registro, login y logout ahora se manejan directamente 
// a través del authClient en el frontend o auth.api en el backend.
// Se mantienen aquí por compatibilidad si es necesario, pero refactorizadas.

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string || "COMPANY_ADMIN";

  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });

    if (user) {
      // Forzar el rol en la base de datos después de la creación
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: role as any,
        },
      });
      return { success: true };
    }
    return { error: "Error al crear el usuario" };
  } catch (error) {
    console.error("Register error:", error);
    return { error: (error as Error).message || "Error al crear el usuario" };
  }
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
}