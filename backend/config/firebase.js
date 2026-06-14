const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    try {
        // Path to your service account key file
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
                // storageBucket: "your-project-id.appspot.com" // Update when you get your bucket name
            });
            console.log("Firebase Admin Initialized successfully with service account.");
        } else {
            console.warn("⚠️ serviceAccountKey.json not found in backend/config! Firebase Admin running in limited mock mode.");
        }
    } catch(err) {
        console.warn("Firebase Admin failed to initialize.", err.message);
    }
}

module.exports = admin;
