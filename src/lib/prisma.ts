import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
const { Pool } = pg

declare global {
  var prismaGlobal: undefined | PrismaClient
  var poolGlobal: undefined | pg.Pool
}

const pool = globalThis.poolGlobal ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalThis.poolGlobal = pool
const adapter = new PrismaPg(pool)
console.log("IS ADAPTER DEFINED?", !!adapter, adapter);

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma


