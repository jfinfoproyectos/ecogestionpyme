import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import prisma from "@/shared/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {},
  },
  session: {
    additionalFields: {},
  },
  plugins: [
    admin({
      defaultRole: "COMPANY_ADMIN",
      adminRole: "PLATFORM_CREATOR",
    }),
  ],
});

export type Role = "PLATFORM_CREATOR" | "COMPANY_ADMIN";