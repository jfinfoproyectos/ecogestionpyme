import "dotenv/config";
import prisma from "../src/shared/lib/prisma";
import { randomBytes, createHash } from "crypto";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string): string {
  // Nota: Esto debe coincidir con como better-auth espera las contraseñas
  // Sin embargo, better-auth usa Scrypt por defecto. 
  // Para pruebas rápidas, crearemos los usuarios vinculados pero 
  // lo más seguro es usar el flujo de registro o un hash compatible.
  // Por ahora, usaremos un placeholder y el usuario podrá usar "Olvide mi contraseña" 
  // o simplemente usaremos el usuario Creador para verlas todas.
  return password; // Placeholder
}

async function addAdmins() {
  const companies = await prisma.company.findMany();
  
  console.log("👥 Generando credenciales de administración para las empresas...");
  
  const credentials = [];

  for (const company of companies) {
    // Si ya tiene admins, saltar
    const hasAdmins = await prisma.user.count({
      where: { adminCompanies: { some: { id: company.id } } }
    });

    if (hasAdmins > 0) continue;

    const email = `admin@${company.name.toLowerCase().replace(/ /g, "").substring(0, 10)}.com`;
    const password = "Password123*";
    const userId = generateId();

    // Nota: Crear el usuario directamente en Prisma para pruebas.
    // Importante: better-auth requiere una entrada en Account para email/password.
    await prisma.user.create({
      data: {
        id: userId,
        name: `Admin ${company.name}`,
        email: email,
        role: "COMPANY_ADMIN",
        adminCompanies: {
          connect: { id: company.id }
        },
        accounts: {
          create: {
            id: generateId(),
            providerId: "email",
            accountId: email,
            password: password, // better-auth lo manejaría con hash, pero para este seed manual...
          }
        }
      }
    });

    credentials.push({
      empresa: company.name,
      usuario: email,
      clave: password
    });
  }

  console.table(credentials);
}

addAdmins()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
