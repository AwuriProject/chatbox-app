const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     const authHeader = req.get('Authorization');
    
//     if (!authHeader) {
//         const error = new Error('No Authorization header provided');
//         error.statusCode = 401;
//         throw error;
//     }
    
//     const token = authHeader.split(' ')[1];
    
//     if (!token) {
//         const error = new Error('No token provided');
//         error.statusCode = 401;
//         throw error;
//     }
    
//     let decodedToken;
//     try {
//         decodedToken = jsonwebtoken.verify(token, 'suspicious');
//     } catch (error) {
//         error.statusCode = 401;
//         error.message = 'Invalid token';
//         throw error;
//     }
    
//     if (!decodedToken) {
//         const error = new Error('Not Authenticated.');
//         error.statusCode = 401;
//         throw error;
//     }
    
//     req.userId = decodedToken.userId;
//     next();
// };


module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated - No token provided');
        error.statusCode = 401;
        throw error;
    }
    
    const token = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
        decodedToken = jwt.verify(token, 'suspicious');
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            const error = new Error('Token has expired - Please login again');
            error.statusCode = 401;
            throw error;
        }
        const error = new Error('Invalid token');
        error.statusCode = 401;
        throw error;
    }
    
    if (!decodedToken) {
        const error = new Error('Not authenticated - Invalid token');
        error.statusCode = 401;
        throw error;
    }
    
    req.userId = decodedToken.userId;
    next();
};