@AGENTS.md

# Instrucciones para Claude Code

Adhiérete estrictamente a **Feature-First Architecture** en `src/features/`.

## Reglas críticas

- Cualquier operación de base de datos (Lectura o Escritura) debe realizarse exclusivamente mediante **Server Actions**
- **PROHIBIDO** usar API Routes de Next.js — toda la comunicación cliente-servidor debe hacerse mediante Server Actions
- La única excepción permitida para API Routes es: webhooks externos y autenticación (better-auth requiere API routes internamente)
- Para sincronizar el esquema de Prisma, usa siempre `npx prisma db push`

## Arquitectura

- Mantén la lógica de negocio en archivos `services.ts` dentro de cada feature
- Llámalos desde los `actions.ts` correspondientes