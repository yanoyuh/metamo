import { PrismaClient } from '@prisma/client'

// Prisma Client のシングルトンインスタンス
export const prisma = new PrismaClient()
