import jwt from 'jsonwebtoken'

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

        req.userId = decoded.sub
        next()
    })
}

export default authMiddleware