import { PrismaClient } from '@prisma/client'
import pg, { type Pool } from 'pg'
const { Pool: PgPool } = pg
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prismaGlobal: undefined | PrismaClient
  var poolGlobal: undefined | Pool
}

const connectionString = process.env.DATABASE_URL

const pool = globalThis.poolGlobal ?? new PgPool({ connectionString })
if (process.env.NODE_ENV !== 'production') globalThis.poolGlobal = pool

const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: ['error'],
  })
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma


