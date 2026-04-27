import "dotenv/config";
import prisma from "../src/shared/lib/prisma";

async function checkCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          waterConsumptions: true,
          energyConsumptions: true,
          wasteRecords: true,
          productionRecords: true
        }
      }
    }
  });

  console.log("\nEmpresas en DB:");
  companies.forEach(c => {
    console.log(`- ${c.name} (NIT: ${c.nit})`);
    console.log(`  📍 ${c.address}`);
    console.log(`  📊 Datos: ${c._count.waterConsumptions} Agua, ${c._count.energyConsumptions} Energía, ${c._count.wasteRecords} Residuos, ${c._count.productionRecords} Producción`);
  });
}

checkCompanies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
