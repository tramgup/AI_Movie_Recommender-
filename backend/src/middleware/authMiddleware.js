import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader){
        return res.status(401).json({message: "No Token provided"})
    }

    const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader


    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { return res.status(401).json({ meassge: "Invalid token" }) }

        req.userEmail = decoded.sub
        next()
    })
}

export async function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader){
        return res.status(401).json({message: "No Token provided"})
    }

    const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) { return res.status(401).json({ message: "Invalid token" }) }

        try {
            const user = await prisma.user.findUnique({
                where: { email: decoded.sub }
            })
            
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
            
            if (!user.isAdmin) {
                return res.status(403).json({ message: "Admin access required" })
            }
            
            req.userEmail = decoded.sub
            req.userId = user.id
            next()
        } catch (err) {
            console.error(err)
            return res.sendStatus(503)
        }
    })
}

export default authMiddleware