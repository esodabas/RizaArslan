const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'riza-arslan-blog-secret-key-2024';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
