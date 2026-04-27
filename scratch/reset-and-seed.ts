import "dotenv/config";
import prisma from "../src/shared/lib/prisma";
import { randomBytes } from "crypto";
import { auth } from "../src/features/auth/lib/auth";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

const CREATOR_ID = "10YVqxD11IBGhc9WSzlmAz4WJIuCXJbi";
const FIXED_PASSWORD = "Password123*";

const COMPANIES = [
  {
    name: "Textiles del Valle de Aburrá S.A.S.",
    nit: "900.123.456-1",
    email: "admin@textilesvalle.com",
    address: "Carrera 52 # 14-30, Guayabal, Medellín",
  },
  {
    name: "Confecciones La Montaña Medellín",
    nit: "890.321.654-2",
    email: "admin@lamontana.com",
    address: "Calle 10 Sur # 48-120, El Poblado, Medellín",
  },
  {
    name: "Moda Sostenible Paisa",
    nit: "901.555.777-3",
    email: "admin@modapaisa.com",
    address: "Circular 4 # 72-10, Laureles, Medellín",
  },
  {
    name: "Dotaciones Textiles de Antioquia",
    nit: "800.999.000-4",
    email: "admin@dotaciones.com",
    address: "Carrera 65 # 80-45, Itagüí, Medellín",
  },
  {
    name: "Uniformes y Diseños del Centro",
    nit: "900.888.111-5",
    email: "admin@uniformes.com",
    address: "Calle 50 (Colombia) # 45-22, El Centro, Medellín",
  }
];

async function cleanAndSeed() {
  console.log("🔥 Limpiando base de datos...");
  
  // Borrar todas las empresas (cascada borrará consumos/residuos)
  await prisma.company.deleteMany({});
  
  // Borrar usuarios que no sean el creador principal
  await prisma.user.deleteMany({
    where: {
      id: { not: CREATOR_ID }
    }
  });

  console.log("🌱 Creando nuevas empresas con usuarios independientes...");

  for (const comp of COMPANIES) {
    const companyId = generateId();
    
    // Crear Empresa
    await prisma.company.create({
      data: {
        id: companyId,
        name: comp.name,
        nit: comp.nit,
        address: comp.address,
        active: true,
        creatorId: CREATOR_ID,
      }
    });

    console.log(`🏢 Empresa creada: ${comp.name}`);

    try {
      // Crear Usuario Admin mediante la API de better-auth para asegurar el hash correcto
      // Mockeamos el entorno mínimo necesario
      await auth.api.signUpEmail({
        body: {
          email: comp.email,
          password: FIXED_PASSWORD,
          name: `Admin ${comp.name}`,
        }
      });

      // Vincular usuario a la empresa y asignar rol
      await prisma.user.update({
        where: { email: comp.email },
        data: {
          role: "COMPANY_ADMIN",
          adminCompanies: {
            connect: { id: companyId }
          }
        }
      });

      console.log(`   👤 Admin creado: ${comp.email} / ${FIXED_PASSWORD}`);
    } catch (err) {
      console.error(`   ❌ Error creando admin para ${comp.name}:`, err);
    }
  }

  console.log("\n✨ Proceso finalizado.");
  console.log("------------------------------------------");
  console.log(`CONTRASEÑA PARA TODOS: ${FIXED_PASSWORD}`);
  console.log("------------------------------------------");
}

cleanAndSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
