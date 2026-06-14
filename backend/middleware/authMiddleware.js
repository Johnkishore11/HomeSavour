const admin = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token using Firebase admin
            // Allow bypassing firebase check if locally mocking (optional, but using actual fb token is better)
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            // Get user from our database based on firebaseUid
            const user = await User.findOne({ firebaseUid: decodedToken.uid });
            
            if (!user) {
                return res.status(401).json({ message: 'User not found in local db' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const chefOnly = (req, res, next) => {
    if (req.user && req.user.role === 'chef') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a chef' });
    }
};

module.exports = { protect, chefOnly };
