import prisma from '../prismaClient.js'

export default async function adminMiddleware(req, res, next) {
    try {
        // authMiddleware sets `req.userEmail` from the token's `sub` claim
        const email = req.userEmail

        if (!email) {
            return res.status(401).json({ message: 'No authenticated user' })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (!user.isAdmin) {
            console.log('FAILED: isAdmin check failed')
            return res.status(403).json({ message: 'Admin access required' })
        }

        req.userId = user.id
        req.user = user
        console.log('SUCCESS: Admin check passed')
        next()
    } catch (err) {
        console.error('ERROR in adminMiddleware:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}