import "dotenv/config";
import prisma from "../src/shared/lib/prisma";
import { randomBytes } from "crypto";

function generateId(): string {
  return randomBytes(16).toString("hex");
}

const CREATOR_ID = "10YVqxD11IBGhc9WSzlmAz4WJIuCXJbi";

const COMPANIES = [
  {
    name: "Textiles del Valle de Aburrá S.A.S.",
    nit: "900.123.456-1",
    address: "Carrera 52 # 14-30, Guayabal, Medellín",
    phone: "+57 (604) 444-1234",
    activities: ["Hilandería", "Tejeduría de punto", "Confección de uniformes"],
  },
  {
    name: "Confecciones La Montaña Medellín",
    nit: "890.321.654-2",
    address: "Calle 10 Sur # 48-120, El Poblado, Medellín",
    phone: "+57 (604) 266-9876",
    activities: ["Fabricación de Jeans", "Tintorería industrial"],
  },
  {
    name: "Moda Sostenible Paisa",
    nit: "901.555.777-3",
    address: "Circular 4 # 72-10, Laureles, Medellín",
    phone: "+57 (312) 456-7890",
    activities: ["Corte y costura", "Estampación ecológica", "Aprovechamiento de retales"],
  },
  {
    name: "Dotaciones Textiles de Antioquia",
    nit: "800.999.000-4",
    address: "Carrera 65 # 80-45, Itagüí, Medellín (Área Metropolitana)",
    phone: "+57 (604) 372-5500",
    activities: ["Confección de ropa de trabajo", "Bordado industrial"],
  },
  {
    name: "Uniformes y Diseños del Centro",
    nit: "900.888.111-5",
    address: "Calle 50 (Colombia) # 45-22, El Centro, Medellín",
    phone: "+57 (604) 511-3344",
    activities: ["Sastrería industrial", "Comercialización de textiles"],
  }
];

async function seed() {
  console.log("🌱 Iniciando inyección de datos realistas para Medellín...");

  for (const comp of COMPANIES) {
    const existing = await prisma.company.findUnique({
      where: { nit: comp.nit }
    });

    if (existing) {
      console.log(`⏩ Saltando ${comp.name} (NIT ya existe)`);
      continue;
    }

    const companyId = generateId();
    await prisma.company.create({
      data: {
        id: companyId,
        name: comp.name,
        nit: comp.nit,
        address: comp.address,
        phone: comp.phone,
        activities: comp.activities,
        active: true,
        creatorId: CREATOR_ID,
      }
    });

    console.log(`✅ Creada: ${comp.name}`);

    // Crear algunos datos de ejemplo para cada empresa
    const period = "2026-04";
    
    // Agua
    await prisma.waterConsumption.create({
      data: {
        id: generateId(),
        companyId,
        amount: Math.floor(Math.random() * 50) + 10,
        dischargeCost: Math.floor(Math.random() * 200000) + 50000,
        period,
        observations: "Consumo normal del mes. Revisión de trampas de grasa realizada."
      }
    });

    // Energía
    await prisma.energyConsumption.create({
      data: {
        id: generateId(),
        companyId,
        amount: Math.floor(Math.random() * 500) + 100,
        reactiveEnergyCost: Math.random() > 0.7 ? Math.floor(Math.random() * 50000) : 0,
        period,
        observations: "Operación en turno diurno y nocturno."
      }
    });

    // Producción
    await prisma.productionRecord.create({
      data: {
        id: generateId(),
        companyId,
        itemsCount: Math.floor(Math.random() * 2000) + 500,
        period,
      }
    });

    // Residuos
    const wasteTypes = ["Retal de punto", "Denim", "Mezclas", "Conos plásticos"];
    for (let i = 0; i < 2; i++) {
      await prisma.wasteRecord.create({
        data: {
          id: generateId(),
          companyId,
          type: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
          weight: Math.floor(Math.random() * 100) + 10,
          isHazardous: Math.random() > 0.9,
          status: "disponible",
          observations: "Residuo generado en proceso de corte."
        }
      });
    }
  }

  console.log("✨ Proceso de inyección completado con éxito.");
}

seed()
  .catch((e) => {
    console.error("❌ Error en el seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
