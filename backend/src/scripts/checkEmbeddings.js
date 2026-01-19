import dotenv from 'dotenv'
dotenv.config()

import prisma from '../prismaClient.js'

async function main(){
  try{
    const nullCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Movie" WHERE "embedding" IS NULL`
    const notNullCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Movie" WHERE "embedding" IS NOT NULL`
    console.log('NULL embeddings count:', nullCount[0] ? nullCount[0].count : nullCount)
    console.log('NOT NULL embeddings count:', notNullCount[0] ? notNullCount[0].count : notNullCount)

    const sampleNull = await prisma.$queryRaw`SELECT id, title FROM "Movie" WHERE "embedding" IS NULL LIMIT 3`
    const sampleNotNull = await prisma.$queryRaw`SELECT id, title FROM "Movie" WHERE "embedding" IS NOT NULL LIMIT 3`

    console.log('\nSample NULL embedding rows:', sampleNull)
    console.log('\nSample NOT NULL embedding rows:', sampleNotNull)
  }catch(err){
    console.error('Error checking embeddings:', err)
    process.exit(1)
  }finally{
    process.exit(0)
  }
}

main()
