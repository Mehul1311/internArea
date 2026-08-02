const admin = require('firebase-admin');

const { getAuth } = require('firebase-admin/auth');

let app;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized with service account.");
  } else {
    // Attempt initialization with project ID for token verification (works without credentials in dev)
    app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'intern-clone'
    });
    console.log("Firebase Admin initialized with fallback projectId.");
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error.message);
}

const auth = getAuth(app);

module.exports = { admin, auth };
