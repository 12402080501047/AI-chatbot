import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: undefined | PrismaClient
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
  })
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma


