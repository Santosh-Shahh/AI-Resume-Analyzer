const jwt = require('jsonwebtoken');

function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId || decoded.id;
    } catch {
        return null;
    }
}

module.exports = { verifyAuth };
