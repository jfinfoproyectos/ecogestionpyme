import prisma from "@/shared/lib/prisma";

export async function getCompanies() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        admins: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export async function getCompanyById(id: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        admins: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return company;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

export async function getStats() {
  try {
    const [companiesCount, usersCount] = await Promise.all([
      prisma.company.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "COMPANY_ADMIN" } }),
    ]);

    return {
      companies: companiesCount,
      users: usersCount,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { companies: 0, users: 0 };
  }
}