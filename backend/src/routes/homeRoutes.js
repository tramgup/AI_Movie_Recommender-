import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const take = 20
  const skip = (page - 1) * take

  try {
    const movies = await prisma.movie.findMany({
      skip,
      take,
      orderBy: { title: 'asc' },
    })

    return res.json({ page, movies })
  } catch (err) {
    console.error(err)
    return res.sendStatus(503)
  }
})

export default router
