const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token provided' }); //401 unauthorized (semantically it means "unauthenticated")
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' }); //401 unauthorized (semantically it means "unauthenticated")
      req.user = decoded;
      next();
    });
  };

  module.exports = verifyToken;